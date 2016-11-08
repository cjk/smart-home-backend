import {EventEmitter} from 'events';
import {assoc, find, isNil, map, pipe, pick, propEq, merge} from 'ramda';
import K from 'kefir';
import schedule from './schedule';
import loadCrontab from './crontab';
import dispatch from './taskDispatcher';

import {scheduledJobIds, runningJobIds, setLastRun, setRunning} from './util';

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

/* Cron side-effects routine */
function onCronTick(eventEmitter) {
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
  /* END of sideeffects */
}

function init(busState$) {
  const cron$ = K.withInterval(1000, (emitter) => {
    emitter.emit(_crontab);
  });

  const eventEmitter = new EventEmitter();

  /* Create task-result-stream that returns task-results as they finished running */
  const taskResult$ = K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => {});
  const onValue = onCronTick(eventEmitter);

  return K.combine([cron$, taskResult$], [busState$], (crontab, results, state) => {
    /* PENDING: No logic here yet */
    console.log(`PING: ${Date.now()}`);
    return {crontab, results, state};
  }).scan((prev, cur) => {
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
  }).observe(onValue);
}

export default init;
