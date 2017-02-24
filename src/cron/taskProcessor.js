// @flow
import type {Crontab, Task, Callback} from '../types';

import K from 'kefir';
import EventEmitter from 'events';
import dispatch from './taskDispatcher';
import {__, assoc, compose, curry, identity, of, tap} from 'ramda';
/* KNX-bus related */
import {writeGroupAddr} from '../knx/performBusAction';
import {createAddress} from '../knx/knx-lib';

const eventEmitter = new EventEmitter();

function createTaskEventStream() {
  const startedEvents$ = K.fromEvents(eventEmitter, 'taskStarted');
  const endedEvents$ = K.fromEvents(eventEmitter, 'taskEnded');

  /* Create task-event-stream that returns task-events as they finished running */
  return K.merge([startedEvents$, endedEvents$]).toProperty(() => of({}));
}

/* Taskrunner: What a task is actually doing - your sideeffects go here! */
function runTask(task: Task, callback: Callback) {
  console.log(`[CRON task-runner] Running task ${JSON.stringify(task)}...`);
  eventEmitter.emit('taskStarted', [task]);

  const address = createAddress(
    {id: task.target, func: 'light', type: 'switch', value: task.act === 'on' ? 1 : 0}
  );
  const markAsEnded = compose(assoc('endedAt', Date.now()), assoc('status', 'ended'));

  /* Write to KNX-bus, then call our task-has-ended-callback with the ended task provided */
  const onEnd = curry((task, err) => {
    callback(err, markAsEnded(task));
  })(task);
  return writeGroupAddr(address, onEnd);
}

/* Cron side-effects routine */
function processTaskEvents() {
  return ({crontab}: {crontab: Crontab}) => {
    const event$ = dispatch(crontab);

    /* This fires after task ran and is in completed / error state: */
    event$.observe({
      value(taskState) {
        eventEmitter.emit('taskEnded', [taskState]);
      },
      error(taskState) {
        console.error(`[CRON task-proc] Error while executing task: ${JSON.stringify(taskState)}`);
        eventEmitter.emit('taskEnded', [taskState]);
      }
    })
  };
}

export {createTaskEventStream, processTaskEvents, runTask};
