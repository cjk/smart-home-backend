/* Given a crontab, filters all waiting tasks from scheduled jobs, starts the task(s) and returns a list of
   result-streams for each running task. */
import K from 'kefir';
import R, {tap, isEmpty, filter, flatten, pipe, pickAll, merge, map, reduce} from 'ramda';
import {scheduled, scheduledJobIds} from './util';

/* Simulated fake async operation */
const runTask = (task, cb) => {
  console.log(`Running task ${JSON.stringify(task)}...`);
  setTimeout(() => {
    console.log(`Completed task ${JSON.stringify(task)}.`);
    cb(null, task);
  }, 500);
};

function dispatch(crontab) {
  if (isEmpty(scheduledJobIds(crontab))) {
    return [];
  }

  const createAddrWriteStream = scheduledTasks => K.fromNodeCallback((callback) => {
    K.sequentially(250, scheduledTasks)
     .onValue(task => runTask(task, callback));
  });

  console.log(`[dispatcher] Scheduled jobs are: ${JSON.stringify(scheduledJobIds(crontab))}`);

  const taskStartProps = {status: 'started', startedAt: Date.now()};
  const scheduledTasks = pipe(
    filter(scheduled),
    reduce((acc, j) => acc.concat(pickAll(['jobId', 'tasks'], j)), []),
    map(j => map(t => R.assoc('jobId', j.jobId, merge(t, taskStartProps)), j.tasks)),
    flatten,
    tap(lst => console.log(`[dispatcher] dispatching tasks: ${JSON.stringify(lst)}`)),
  );
  const result$ = createAddrWriteStream(scheduledTasks(crontab));

  return [result$];
}

export default dispatch;
