/* General purpose functions */
import {__, all, assoc, curry, indexOf, filter, compose, eqProps, find, findIndex, pipe, pluck, propEq, update} from 'ramda';

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

  if (!job) return crontab;

  const withId = propEq('id');

  /* Find the old task in the job, replace it with updated task and update job with new tasks. Then update job in given
     crontab and return it back */
  return pipe(
    findIndex(withId(task.id)),
    update(__, task, job.tasks),
    assoc('tasks', __, job),
    update(indexOf(job, crontab), __, crontab)
  )(job.tasks);
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
