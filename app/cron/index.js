import {EventEmitter} from 'events';
import R, {map, pluck, assoc, merge, filter, compose, pipe, head, prop, props, propEq, isEmpty, not} from 'ramda';
import K from 'kefir';
import schedule from './schedule';
import loadCrontab from './crontab';
import dispatch from './taskDispatcher';

import {scheduledJobIds, runningJobIds} from './util';

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

function init(busState$) {
  const cron$ = K.withInterval(1000, (emitter) => {
    emitter.emit(_crontab);
  });

  const eventEmitter = new EventEmitter();

  /* TODO: Define action-result-stream that emits completed rules so we can set running=false in our state */
  const actionResult$ = K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => {});

  /* Sideeffects routine */
  const onValue = ({crontab}) => {
    console.log(`[onValue] Job(s) <${scheduledJobIds(crontab)}> scheduled.`);
    console.log(`[onValue] Job(s) <${runningJobIds(crontab)}> running.`);

    const taskStreams = dispatch(crontab);

    /* TODO: Need to trigger the action-results stream with done rule-id */
    //     result$.flatMap(v => console.log(`got ${v}`));
    map(result$ =>
      result$.onValue((taskState) => { console.log(`[result$] ${JSON.stringify(taskState)}`); eventEmitter.emit('actionFinished', taskState); })
    )(taskStreams);
  };

  /* END of sideeffects */

  return K.combine([cron$, actionResult$], [busState$], (crontab, results, state) => {
    /* PENDING: No logic here yet */
    console.log(`PING: ${Date.now()}`);
    return {crontab, results, state};
  }).scan((prev, cur) => {
    const {crontab, state, results} = cur;

    /* DEBUGGING */
    // console.log(`[PREV] ${JSON.stringify(prev)}`);
    // console.log(`[CUR] ${JSON.stringify(cur)}`);

    console.log(`[Results-In-Stream] ${JSON.stringify(results)}`);

    const syncWithPrevJobs = map((j) => {
      const syncedProps = ['running', 'scheduled', 'lastRun'];
      console.log(`Looking for jobId <${j.jobId}> in previous job.`);
      const prevJob = R.find(R.propEq('jobId', j.jobId), prev.crontab);
      if (R.isNil(prevJob)) {
        /* TODO: Make sure returning nothing is OK here! */
        console.log(`No previous job <${j.jobId}> found.`);
        return j;
      }
      return R.merge(j, R.pick(syncedProps, prevJob));
    });

    console.log(`[synced] ${JSON.stringify(syncWithPrevJobs(crontab))}`);

    const setRunning = assoc('running', true);
    const setLastRun = assoc('lastRun', Date.now());

    /* Schedule jobs */
    const schedCrontab = schedule(syncWithPrevJobs(crontab));

    const initiateJob = R.pipe(
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
