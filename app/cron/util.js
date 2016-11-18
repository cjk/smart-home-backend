/* General purpose functions */
import {__, all, assoc, curry, empty, indexOf, filter, compose, eqProps, find, findIndex, pluck, propEq, update} from 'ramda';

const scheduled = j => j.scheduled;
const running = j => j.running;

const setRunning = assoc('running', true);
const setLastRun = assoc('lastRun', Date.now());

const scheduledJobIds = compose(
  pluck('jobId'),
  filter(running)
);

const runningJobIds = compose(
  pluck('jobId'),
  filter(scheduled)
);

const significantTaskProps = ['startedAt', 'endedAt', 'status'];
const taskHasSameState = (taskA, taskB) => all(eqProps(__, taskA, taskB), significantTaskProps);

function _getJob(jobId, crontab) {
  return find(propEq('jobId', jobId), crontab);
}
const getJob = curry(_getJob);

function updateTaskFromEvent(event, crontab) {
  const {jobId, ...task} = event;
  const job = find(propEq('jobId', jobId), crontab);
  if (!job)
    return crontab;

  const idx = findIndex(propEq('id', task.id))(job.tasks);
  const newTasks = update(idx, task)(job.tasks);
  const newJob = assoc('tasks', newTasks)(job);
  return update(indexOf(job, crontab), newJob, crontab);
}

export {
  scheduled,
  running,
  setLastRun,
  setRunning,
  scheduledJobIds,
  runningJobIds,
  getJob,
  updateTaskFromEvent
};
