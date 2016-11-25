// @flow

import R, {__, assoc, cond, find, findIndex, indexOf, isEmpty, isNil, map, not, pipe, prop, propEq, update} from 'ramda';
import {anyRunningTasks, onlyEndedTasks, setEnded, setLastRun, setRunning, syncWithPrevJobs, withId} from './util';

import type {CronJob, Crontab, Task, TaskEvent} from '../../smart-home-backend.js.flow';

const jobShouldRun = (j: CronJob) => {
  const isDaily = propEq('repeat', 'daily', j);
  const isRunning = propEq('running', true, j);
  const hasFixedTime = not(isNil(prop('at', j)));
  const hasRun = not(isNil(prop('lastRun', j)));

  return not(hasRun) && not(isRunning) && isDaily && hasFixedTime;
  //   return not(isRunning);
};

const setJobStateFromTasksState = (j: CronJob) =>
  cond([
    [anyRunningTasks, setRunning],
    [onlyEndedTasks, setEnded],
    [R.T, job => job]/* Default fallback: return job unchanged */
  ])(j);

const updateTaskInJob = (job: CronJob, task: Task) => pipe(
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
  return R.reduce((tab, event) => {
    if (isEmpty(event)) return tab;

    return updateTaskFromEvent(event, tab);
  }, crontab, taskEvents);
}
const updateFromTaskEvents = R.curry(_updateFromTaskEvents);

const schedule = (crontab: Crontab) =>
  map(j => assoc('scheduled', jobShouldRun(j), j))(crontab);

/* TICK-function called on each cron-timer iteration.
 * Brings over job-state from last tick. */
function scheduleTick(prev, cur) {
  const {crontab, state, taskEvents} = cur;

  /* DEBUGGING */
  console.log(`[taskEvents-in-stream] ${JSON.stringify(taskEvents)}`);

  const newCrontab = pipe(
    syncWithPrevJobs(prev.crontab),
    schedule,
    updateFromTaskEvents(taskEvents)
  )(crontab);

  console.log(`[newCrontab] ${JSON.stringify(newCrontab)}`);

  const initiateJob = pipe(
    setRunning,
    setLastRun
  );

  /* Set scheduled jobs as running + lastRun-timestamp */
  const jobs = map(j => (j.scheduled ? initiateJob(j) : j), newCrontab);

  /* Update state with new crontab */
  const newState = assoc('crontab', jobs, cur);

  /* DEBUGGING */
  // console.log(`<${scheduledJobIds(newState.crontab).length}> jobs scheduled.`);
  // console.log(`<${runningJobIds(newState.crontab).length}> jobs running.`);
  console.log(`[finalSchedule]: ${JSON.stringify(newState.crontab)}`);

  return newState;
}

export default scheduleTick;
