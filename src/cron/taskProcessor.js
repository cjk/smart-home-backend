// @flow
import K from 'kefir';
import EventEmitter from 'events';
import R, {assoc, compose} from 'ramda';
import dispatch from './taskDispatcher';

import type {Crontab, Task, Callback} from '../../smart-home-backend.js.flow';

const eventEmitter = new EventEmitter();

function createTaskEventStream() {
  const startedEvents$ = K.fromEvents(eventEmitter, 'taskStarted');
  const endedEvents$ = K.fromEvents(eventEmitter, 'taskEnded');

  /* Create task-event-stream that returns task-events as they finished running */
  return K.merge([startedEvents$, endedEvents$]).toProperty(() => R.of({}));
}

/* Taskrunner: What a task is actually doing - your sideeffects go here! */
function runTask(task: Task, callback: Callback) {
  /* PENDING: Simulated fake async operation */
  console.log(`[CRON] Started task ${JSON.stringify(task)}...`);
  eventEmitter.emit('taskStarted', [task]);

  setTimeout(() => {
    //     console.log(`Completed task ${JSON.stringify(task)}.`);
    const end = compose(assoc('endedAt', Date.now()), assoc('status', 'ended'));

    callback(null, end(task));
  }, 500);
}

/* Cron side-effects routine */
function processTaskEvents() {
  return ({crontab}: {crontab: Crontab}) => {
    const event$ = dispatch(crontab);

    event$.onValue(
      taskState => eventEmitter.emit('taskEnded', [taskState])
    );
  };
}

export {createTaskEventStream, processTaskEvents, runTask};
