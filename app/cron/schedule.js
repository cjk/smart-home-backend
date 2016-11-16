import {assoc, find, isNil, map, not, pipe, pick, prop, propEq, merge} from 'ramda';
import {scheduledJobIds, runningJobIds, setLastRun, setRunning} from './util';

const jobShouldRun = (j) => {
  const isDaily = propEq('repeat', 'daily', j);
  const isRunning = propEq('running', true, j);
  const hasFixedTime = not(isNil(prop('at', j)));
  const hasRun = not(isNil(prop('lastRun', j)));

  return not(hasRun) && not(isRunning) && isDaily && hasFixedTime;
  //   return not(isRunning);
};

const syncWithPrevJobs = prevCrontab => map((j) => {
  const syncedProps = ['running', 'scheduled', 'lastRun'];
  console.log(`Looking for jobId <${j.jobId}> in previous job.`);
  const prevJob = find(propEq('jobId', j.jobId), prevCrontab);
  if (isNil(prevJob)) {
    console.log(`No previous job <${j.jobId}> found.`);
    return j;
  }
  return merge(j, pick(syncedProps, prevJob));
});

function schedule(crontab) {
  const scheduledTab = map(j => assoc('scheduled', jobShouldRun(j), j));
  return scheduledTab(crontab);
}

/* TICK-function called on each cron-timer iteration.
 * Brings over job-state from last tick. */
function scheduleTick(prev, cur) {
  const {crontab, state, taskEvents} = cur;

  /* Synchronize crontab with previous state and schedule jobs that can/should run */
  const schedCrontab = schedule(syncWithPrevJobs(prev.crontab)(crontab));

  /* DEBUGGING */
  console.log(`[taskEvents-in-stream] ${JSON.stringify(taskEvents)}`);
  console.log(`[synced] ${JSON.stringify(schedCrontab)}`);

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

export default scheduleTick;
