// @flow
import {differenceInHours, differenceInSeconds, format, parse} from 'date-fns';

import R, {__, assoc, cond, find, findIndex, indexOf, isEmpty, isNil,
           map, pipe, prop, propEq, reduce, update} from 'ramda';
import {anyRunningTasks, onlyEndedTasks, setEnded, setLastRun, setRunning, syncWithPrevJobs, withId} from './util';

import type {AppState, CronJob, Crontab, TaskMeta, TaskEvent} from '../../smart-home-backend.js.flow';

const fixedTimeIsNow = (j: CronJob) => {
  const now = new Date();
  const lastRunTs = new Date(prop('lastRun', j));
  const noFixedTime = isNil(prop('at', j));
  const hasRun = differenceInHours(now, lastRunTs) <= 23;

  if (noFixedTime || hasRun)
    return false;

  const targetTs = parse(format(now, `YYYY-MM-DDT${j.at}`));
  const secondsToStart = differenceInSeconds(targetTs, now);

  console.log(`>>>> next daily job will run in ${secondsToStart} seconds.`);

  return secondsToStart >= 0 && secondsToStart <= 1;
};

const jobShouldRun = (j: CronJob) => {
  const isDaily = propEq('repeat', 'daily', j);
  const notRunning = propEq('running', false, j);

  return isDaily && notRunning && fixedTimeIsNow(j);
};

/* TODO: Out of place here, move to dispatcher?! */
const initiateJob = pipe(
  setRunning,
  setLastRun
);

const setJobStateFromTasksState = (j: CronJob) =>
  cond([
    [anyRunningTasks, setRunning],
    [onlyEndedTasks, setEnded],
    [R.T, job => job] /* Default fallback: return job unchanged */
  ])(j);

const updateTaskInJob = (job: CronJob, task: TaskMeta) => pipe(
  findIndex(withId(task.id)),
  update(__, task, job.tasks),
  assoc('tasks', __, job),
  setJobStateFromTasksState,
)(job.tasks);

const updateTaskFromEvent = (event: TaskEvent, crontab: Crontab) => {
  const {jobId, ...task} = event;
  const job = find(propEq('jobId', jobId), crontab);

  if (!job) return crontab;

  /* Find the old task in the job, replace it with updated task and update job with new tasks. Then update job in given
     crontab and return it back */
  const newCrontab = updateTaskInJob(job, task);
  return update(indexOf(job, crontab), newCrontab, crontab);
};

/* Merge one or more task-events into it's corresponding job's tasks */
function _updateFromTaskEvents(taskEvents: TaskEvent, crontab: Crontab) {
  return reduce((tab, event) => {
    if (isEmpty(event)) return tab;

    return updateTaskFromEvent(event, tab);
  }, crontab, taskEvents);
}
const updateFromTaskEvents = R.curry(_updateFromTaskEvents);

const schedule = (crontab: Crontab) =>
  map(j => assoc('scheduled', jobShouldRun(j), j))(crontab);

/* TICK-function called on each cron-timer iteration.
 * Brings over job-state from last tick. */
function scheduleTick(prev: AppState, cur: AppState) {
  const {crontab, state, taskEvents} = cur;

  /* DEBUGGING */
  console.log(`[taskEvents-in-stream] ${JSON.stringify(taskEvents)}`);

  const newCrontab = pipe(
    syncWithPrevJobs(prev.crontab),
    schedule,
    updateFromTaskEvents(taskEvents)
  )(crontab);

  //   console.log(`[newCrontab] ${JSON.stringify(newCrontab)}`);

  /* Set scheduled jobs as running + lastRun-timestamp */
  const jobs = map(j => (j.scheduled ? initiateJob(j) : j), newCrontab);

  /* Update state with new crontab */
  const newState = assoc('crontab', jobs, cur);

  /* DEBUGGING */
  console.log(`[schedule - final]: ${JSON.stringify(newState.crontab)}`);

  return newState;
}

export default scheduleTick;
