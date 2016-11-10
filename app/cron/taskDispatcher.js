/* Given a crontab, filters all waiting tasks from scheduled jobs, starts the task(s) and returns a list of
   result-streams for each running task. */
import K from 'kefir';
import {assoc, tap, isEmpty, filter, flatten, pipe, pickAll, merge, map, reduce} from 'ramda';
import {scheduled, scheduledJobIds} from './util';
import {runTask} from './taskProcessor';

/* Given a crontab returns a stream of dispatched tasks */
function dispatch(crontab) {
  if (isEmpty(scheduledJobIds(crontab))) {
    return K.constant({});/* immediately return a stream holding an empty class if no jobs are scheduled */
  }

  const createAddrWriteStream = scheduledTasks =>
    K.sequentially(250, scheduledTasks)
     .flatMap(task => K.fromNodeCallback(callback => runTask(task, callback)));

  console.log(`[dispatcher] Scheduled jobs are: ${JSON.stringify(scheduledJobIds(crontab))}`);

  const taskStartProps = {status: 'started', startedAt: Date.now()};
  const scheduledTasks = pipe(
    filter(scheduled),
    reduce((acc, j) => acc.concat(pickAll(['jobId', 'tasks'], j)), []),
    map(j => map(t => assoc('jobId', j.jobId, merge(t, taskStartProps)), j.tasks)),
    flatten,
    tap(lst => console.log(`[dispatcher] dispatching tasks: ${JSON.stringify(lst)}`)),
  );

  return createAddrWriteStream(scheduledTasks(crontab));
}

export default dispatch;
