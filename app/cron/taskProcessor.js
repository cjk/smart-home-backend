import K from 'kefir';
import {EventEmitter} from 'events';
import {assoc, compose} from 'ramda';
import dispatch from './taskDispatcher';
import {scheduledJobIds, runningJobIds} from './util';

const eventEmitter = new EventEmitter();

function createTaskResultStream() {
  /* Create task-result-stream that returns task-results as they finished running */
  return K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => {});
}

/* Taskrunner: What a task is actually doing - your sideeffects go here! */
function runTask(task, callback) {
  /* PENDING: Simulated fake async operation */
  console.log(`Started task ${JSON.stringify(task)}...`);
  setTimeout(() => {
    //     console.log(`Completed task ${JSON.stringify(task)}.`);
    const end = compose(assoc('endedAt', Date.now()), assoc('status', 'ended'));

    callback(null, end(task));
  }, 500);
}

/* Cron side-effects routine */
function processTaskResults() {
  return ({crontab}) => {
    console.log(`[onValue] Job(s) <${scheduledJobIds(crontab)}> scheduled.`);
    console.log(`[onValue] Job(s) <${runningJobIds(crontab)}> running.`);

    const result$ = dispatch(crontab);

    result$.onValue(
      (taskState) => {
        console.log(`[result$] ${JSON.stringify(taskState)}`); eventEmitter.emit('actionFinished', taskState);
      }
    );
  };
}

export {createTaskResultStream, processTaskResults, runTask};
