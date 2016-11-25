/* General purpose functions */
import R, {all, any, assoc, compose, curry, isNil, map, merge, filter, find, pick, pipe, pluck, propEq, tap} from 'ramda';

import type {CronJob} from '../../smart-home-backend.js.flow';

const scheduled = (j: CronJob) => j.scheduled;
const running = (j: CronJob) => j.running;

const setRunning = assoc('running', true);
const setEnded = assoc('running', false);
const setLastRun = assoc('lastRun', Date.now());

const scheduledJobIds = compose(
  pluck('jobId'),
  filter(running)
);

const runningJobIds = compose(
  pluck('jobId'),
  filter(scheduled)
);

const withId = propEq('id');

const anyRunningTasks = (j: CronJob) => any(t => t.status === 'started', j.tasks);
const onlyEndedTasks = (j: CronJob) => all(t => t.status === 'ended', j.tasks);

function _getJob(jobId, crontab) {
  return find(propEq('jobId', jobId), crontab);
}
const getJob = curry(_getJob);

function syncWithPrevJobs(prevCrontab) {
  return map((j) => { /* Map current crontab */
    const syncedProps = ['running', 'scheduled', 'lastRun'];
    const prevJob = find(propEq('jobId', j.jobId), prevCrontab);
    if (isNil(prevJob)) {
      console.warn(`No previous job <${j.jobId}> found.`);
      return j;
    }
    return assoc('tasks', prevJob.tasks, merge(j, pick(syncedProps, prevJob)));
  });
}

export {
  anyRunningTasks,
  onlyEndedTasks,
  getJob,
  running,
  setLastRun,
  setRunning,
  setEnded,
  runningJobIds,
  scheduled,
  scheduledJobIds,
  syncWithPrevJobs,
  withId
};
