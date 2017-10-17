// @flow

/* Given a crontab, filters all waiting tasks from scheduled jobs, starts the task(s) and returns a list of
   event-streams for each running task. */
import type { Crontab } from '../types';

import logger from 'debug';
import K from 'kefir';
import {
  assoc,
  tap,
  isEmpty,
  filter,
  flatten,
  pipe,
  pickAll,
  merge,
  map,
  reduce,
} from 'ramda';
import { scheduled, scheduledJobIds } from './util';
import { runTask } from './taskProcessor';

const debug = logger('smt-dispatcher');

/* Given a crontab returns a stream of dispatched tasks */
export default function dispatch(crontab: Crontab) {
  if (isEmpty(scheduledJobIds(crontab))) {
    return K.never(); /* Make sure we create no events if there are no scheduled tasks */
  }

  const createAddrWriteStream = scheduledTasks =>
    K.sequentially(250, scheduledTasks).flatMap(task =>
      K.fromNodeCallback(callback => runTask(task, callback))
    );

  /* DEBUG */
  //   debug(`Scheduled job-list: ${JSON.stringify(scheduledJobIds(crontab))}`);

  const taskStartProps = { status: 'started', startedAt: Date.now() };
  const scheduledTasks = pipe(
    filter(scheduled),
    reduce((acc, j) => acc.concat(pickAll(['jobId', 'tasks'], j)), []),
    map(j =>
      map(t => assoc('jobId', j.jobId, merge(t, taskStartProps)), j.tasks)
    ),
    flatten,
    tap(
      lst =>
        !isEmpty(lst)
          ? debug(`dispatching tasks: ${JSON.stringify(lst)}`)
          : false
    )
  );

  return createAddrWriteStream(scheduledTasks(crontab));
}
