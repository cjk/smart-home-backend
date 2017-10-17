// @flow

/* This module takes a look at the crontab / list of tasks and schedules them according to their metadata.
 * Currently supported task-types:
 * - Daily tasks with explicit start time
 *
 * NOT yet supported task-types:
 * - Daily tasks without explicit start time (should automatically run at, let's say, midnight)
 * - Monthly tasks
 * - Dynamic tasks (created at runtime, like for ad-hoc actions)
 */
import logger from 'debug';
import type { AppState, CronJob, Crontab, Task, TaskEvent } from '../types';

import {
  differenceInHours,
  differenceInSeconds,
  format,
  parse,
} from 'date-fns';
import R, {
  __,
  assoc,
  cond,
  find,
  findIndex,
  indexOf,
  isEmpty,
  isNil,
  map,
  pipe,
  prop,
  propEq,
  reduce,
  update,
} from 'ramda';
import {
  anyRunningTasks,
  onlyEndedTasks,
  setEnded,
  setLastRun,
  setRunning,
  syncWithPrevJobs,
  withId,
} from './util';

const debug = logger('smt-cron'),
  error = logger('error');

const fixedTimeIsNow = (j: CronJob) => {
  const now = new Date();
  const lastRunTs = new Date(prop('lastRun', j));
  const noFixedTime = isNil(prop('at', j));
  const hasRun = differenceInHours(now, lastRunTs) <= 23;

  /* Bail on unsupported task-properties */
  if (noFixedTime || hasRun) return false;

  const targetTs = parse(format(now, `YYYY-MM-DDT${j.at}`));
  const secondsToStart = differenceInSeconds(targetTs, now);

  if (secondsToStart > 0 && secondsToStart <= 60)
    debug(`Daily job #${j.jobId} will run in ${secondsToStart} seconds.`);

  return secondsToStart >= 0 && secondsToStart <= 1;
};

const jobShouldRun = (j: CronJob) => {
  const isDaily = propEq('repeat', 'daily', j);
  const notRunning = propEq('running', false, j);

  return isDaily && notRunning && fixedTimeIsNow(j);
};

/* TODO: Out of place here, move to dispatcher?! */
const initiateJob = pipe(setRunning, setLastRun);

const setJobStateFromTasksState = (j: CronJob) =>
  cond([
    [anyRunningTasks, setRunning],
    [onlyEndedTasks, setEnded],
    [R.T, job => job] /* Default fallback: return job unchanged */,
  ])(j);

const updateTaskInJob = (job: CronJob, task: Task) =>
  pipe(
    findIndex(withId(task.id)),
    update(__, task, job.tasks),
    assoc('tasks', __, job),
    setJobStateFromTasksState
  )(job.tasks);

const updateTaskFromEvent = (event: TaskEvent, crontab: Crontab) => {
  const { jobId, ...task } = event;
  const job = find(propEq('jobId', jobId), crontab);

  if (!job) return crontab;

  /* Find the old task in the job, replace it with updated task and update job with new tasks. Then update job in given
     crontab and return it back */
  const newCrontab = updateTaskInJob(job, task);
  return update(indexOf(job, crontab), newCrontab, crontab);
};

/* Merge one or more task-events into it's corresponding job's tasks */
function _updateFromTaskEvents(taskEvents: Task, crontab: Crontab) {
  return reduce(
    (tab, event) => {
      if (isEmpty(event)) return tab;

      return updateTaskFromEvent(event, tab);
    },
    crontab,
    taskEvents
  );
}
const updateFromTaskEvents = R.curry(_updateFromTaskEvents);

const schedule = (crontab: Crontab) =>
  map(j => assoc('scheduled', jobShouldRun(j), j))(crontab);

/* TICK-function called on each cron-timer iteration.
 * Brings over job-state from last tick. */
export default function scheduleTick(prev: AppState, cur: AppState) {
  const { crontab, state, taskEvents } = cur;

  const newCrontab = pipe(
    syncWithPrevJobs(prev.crontab),
    schedule,
    updateFromTaskEvents(taskEvents)
  )(crontab);

  /* Set scheduled jobs as running + lastRun-timestamp */
  const jobs = map(j => (j.scheduled ? initiateJob(j) : j), newCrontab);

  /* Update state with new crontab */
  const newState = assoc('crontab', jobs, cur);

  return newState;
}
