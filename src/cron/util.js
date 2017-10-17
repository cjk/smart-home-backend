/* @flow */

import type { Crontab, CronJob, CrontabTask } from '../types';

/* General purpose functions */
import logger from 'debug';
import {
  all,
  any,
  assoc,
  compose,
  curry,
  dissoc,
  flatten,
  isEmpty,
  isNil,
  map,
  merge,
  filter,
  find,
  pick,
  pluck,
  propEq,
  reject,
  scan,
} from 'ramda';

const debug = logger('smt');

const scheduled = (j: CronJob) => j.scheduled;
const running = (j: CronJob) => j.running;

const setRunning = assoc('running', true);
const setEnded = assoc('running', false);
const setLastRun = assoc('lastRun', Date.now());

const scheduledJobIds = compose(pluck('jobId'), filter(running));

const runningJobIds = compose(pluck('jobId'), filter(scheduled));

const withId = propEq('id');

const anyRunningTasks = (j: CronJob) =>
  any(t => t.status === 'started', j.tasks);
const onlyEndedTasks = (j: CronJob) => all(t => t.status === 'ended', j.tasks);

function _getJob(jobId, crontab) {
  return find(propEq('jobId', jobId), crontab);
}
const getJob = curry(_getJob);

function syncWithPrevJobs(prevCrontab: Crontab) {
  return map(j => {
    /* Map current crontab */
    const syncedProps = ['running', 'scheduled', 'lastRun'];
    const prevJob = find(propEq('jobId', j.jobId), prevCrontab);
    if (isNil(prevJob)) {
      debug(`No previous job <${j.jobId}> found.`);
      return j;
    }
    //     debug(`SYNC-WITH-PREV-JOB: ${JSON.stringify(j)}`);
    return assoc('tasks', prevJob.tasks, merge(j, pick(syncedProps, prevJob)));
  });
}

function normalizeTasks(taskArray: Array<CrontabTask>) {
  let idIdx: number = 0;
  // attributes all tasks share
  const taskMeta = { id: 10, status: 'idle', startedAt: null, endedAt: null };
  /* Each unfolded task get's it own, single task-property */
  const addTargetPropToTask = assoc('target');
  /* Targets-array is removed from task in favour of single target-property for each unfolded task */
  const removeTaskTargets = dissoc('targets');

  /* Not sure how to prevent this for now, but R.scan leaves it's initial object as is :( */
  const removeEmptyTasks = reject(isEmpty);

  /* Make sure all task-IDs are unique */
  const incId = () => (idIdx += 1);
  const uniqueId = map(t => assoc('id', incId(), t));

  const normalizeTask = (task: CrontabTask) =>
    uniqueId(
      removeEmptyTasks(
        scan(
          (acc, target) =>
            merge(
              removeTaskTargets(task),
              merge(taskMeta, addTargetPropToTask(target, acc))
            ),
          {},
          task.targets
        )
      )
    );

  return flatten(map(normalizeTask, taskArray));
}

export {
  normalizeTasks,
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
  withId,
};
