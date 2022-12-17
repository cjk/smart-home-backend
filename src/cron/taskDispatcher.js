// @flow

/* Given a crontab, filters all waiting tasks from scheduled jobs, starts the task(s) and returns a list of
   event-streams for each running task. */
import type { Crontab } from '../types.js'

import K from 'kefir'
import { assoc, tap, isEmpty, filter, flatten, pipe, pickAll, mergeRight, map, reduce } from 'ramda'
import { scheduled, scheduledJobIds } from './util.js'
import { runTask } from './taskProcessor.js'
import { logger } from '../lib/debug.js'

const log = logger('backend:dispatcher')

/* Given a crontab returns a stream of dispatched tasks */
export default function dispatch(crontab: Crontab) {
  if (isEmpty(scheduledJobIds(crontab))) {
    return K.never() /* Make sure we create no events if there are no scheduled tasks */
  }

  const createAddrWriteStream = (scheduledTasks) =>
    K.sequentially(250, scheduledTasks).flatMap((task) => K.fromNodeCallback((callback) => runTask(task, callback)))

  /* DEBUG */
  //   log.debug(`Scheduled job-list: ${JSON.stringify(scheduledJobIds(crontab))}`);

  const taskStartProps = { status: 'started', startedAt: Date.now() }
  const scheduledTasks = pipe(
    filter(scheduled),
    reduce((acc, j) => acc.concat(pickAll(['jobId', 'tasks'], j)), []),
    map((j) => map((t) => assoc('jobId', j.jobId, mergeRight(t, taskStartProps)), j.tasks)),
    flatten,
    tap((lst) => (!isEmpty(lst) ? log.debug(`dispatching tasks: ${JSON.stringify(lst)}`) : false))
  )

  return createAddrWriteStream(scheduledTasks(crontab))
}
