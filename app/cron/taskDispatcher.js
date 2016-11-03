/* Given a crontab, filters all waiting tasks from scheduled jobs, starts the task(s) and returns a list of
   result-streams for each running task. */
import K from 'kefir';
import R, {tap, isEmpty, filter, flatten, pipe, pickAll, merge, map, reduce} from 'ramda';
import {scheduled, scheduledJobIds} from './util';

/* Simulated fake async operation */
const writeGroupAddr = (addr, cb) => {
  console.log(`Writing address ${JSON.stringify(addr)}...`);
  setTimeout(() => {
    console.log(`Address ${JSON.stringify(addr)} written`);
    cb(null, addr);
  }, 500);
};

function dispatch(crontab) {
  if (isEmpty(scheduledJobIds(crontab))) {
    return [];
  }

  const createAddrWriteStream = scheduledTasks => K.fromNodeCallback((callback) => {
    K.sequentially(250, scheduledTasks)
     .onValue(task => writeGroupAddr(task.target, callback));
  });

  console.log(`[dispatcher] Scheduled jobs: ${JSON.stringify(scheduledJobIds(crontab))}`);

  const taskStartProps = {status: 'started', startedAt: Date.now()};
  const scheduledTasks = pipe(
    filter(scheduled),
    reduce((acc, j) => acc.concat(pickAll(['jobId', 'tasks'], j)), []),
    map(j => map(t => R.assoc('jobId', j.jobId, merge(t, taskStartProps)), j.tasks)),
    flatten,
    tap(lst => console.log(`>>> ${JSON.stringify(lst)}`)),
  );
  const result$ = createAddrWriteStream(scheduledTasks(crontab));

  return [result$];
}

export default dispatch;
