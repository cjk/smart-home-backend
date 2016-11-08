import {EventEmitter} from 'events';
import {assoc, find, isNil, map, pipe, pick, propEq, merge} from 'ramda';
import K from 'kefir';
import schedule from './schedule';
import dispatch from './taskDispatcher';
import {scheduledJobIds, runningJobIds, setLastRun, setRunning} from './util';

const eventEmitter = new EventEmitter();

function createTaskResultStream() {
  /* Create task-result-stream that returns task-results as they finished running */
  return K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => {});
}

function prepareSchedule(prev, cur) {
  const {crontab, state, results} = cur;

  console.log(`[Results-In-Stream] ${JSON.stringify(results)}`);

  const syncWithPrevJobs = map((j) => {
    const syncedProps = ['running', 'scheduled', 'lastRun'];
    console.log(`Looking for jobId <${j.jobId}> in previous job.`);
    const prevJob = find(propEq('jobId', j.jobId), prev.crontab);
    if (isNil(prevJob)) {
      /* TODO: Make sure returning nothing is OK here! */
      console.log(`No previous job <${j.jobId}> found.`);
      return j;
    }
    return merge(j, pick(syncedProps, prevJob));
  });

  console.log(`[synced] ${JSON.stringify(syncWithPrevJobs(crontab))}`);

  /* Schedule jobs */
  const schedCrontab = schedule(syncWithPrevJobs(crontab));

  const initiateJob = pipe(
    setRunning,
    setLastRun
  );

  /* Set scheduled jobs as running + lastRun-timestamp */
  const jobs = map(j => (j.scheduled ? initiateJob(j) : j), schedCrontab);

  /* Update state with new crontab */
  const newState = assoc('crontab', jobs, cur);

  console.log(`<${scheduledJobIds(newState.crontab).length}> jobs scheduled.`);
  console.log(`<${runningJobIds(newState.crontab).length}> jobs running.`);

  console.log(`[finalSchedule]: ${JSON.stringify(newState.crontab)}`);

  return newState;
}

/* Cron side-effects routine */
function processTask() {
  return ({crontab}) => {
    console.log(`[onValue] Job(s) <${scheduledJobIds(crontab)}> scheduled.`);
    console.log(`[onValue] Job(s) <${runningJobIds(crontab)}> running.`);

    const taskStreams = dispatch(crontab);

    map(result$ =>
      result$.onValue(
        (taskState) => {
          console.log(`[result$] ${JSON.stringify(taskState)}`); eventEmitter.emit('actionFinished', taskState);
        }
      )
    )(taskStreams);
  };
}

export {createTaskResultStream, prepareSchedule, processTask};
