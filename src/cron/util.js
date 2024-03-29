/* @flow */

import type { Crontab, CronJob, CrontabTask } from '../types.js'

/* General purpose functions */
import * as R from 'ramda'
import { logger } from '../lib/debug.js'

const log = logger('backend:cron')

const scheduled = (j: CronJob) => j.scheduled
const running = (j: CronJob) => j.running

const setRunning = R.assoc('running', true)
const setEnded = R.assoc('running', false)
const setLastRun = (j: CronJob) => R.assoc('lastRun', Date.now(), j)

const scheduledJobIds = R.compose(R.pluck('jobId'), R.filter(running))

const runningJobIds = R.compose(R.pluck('jobId'), R.filter(scheduled))

const withId = R.propEq('id')

const anyRunningTasks = (j: CronJob) => R.any((t) => t.status === 'started', j.tasks)
const onlyEndedTasks = (j: CronJob) => R.all((t) => t.status === 'ended', j.tasks)

function _getJob(jobId, crontab) {
  return R.find(R.propEq('jobId', jobId), crontab)
}
const getJob = R.curry(_getJob)

function syncWithPrevJobs(
  { crontab: prevCrontab }: { crontab: Crontab },
  { crontab: currCrontab }: { crontab: Crontab }
) {
  return R.map((j) => {
    /* Map current crontab */
    const prevJob = R.find(R.propEq('jobId', j.jobId), prevCrontab)
    if (R.isNil(prevJob)) {
      log.debug(`No previous job <${j.jobId}> found.`)
      return j
    }
    // log.debug(`SYNC-WITH-PREV-JOB: ${JSON.stringify(j)}`);
    return R.assoc('tasks', prevJob.tasks, R.mergeRight(j, R.pick(['running', 'scheduled', 'lastRun'], prevJob)))
  }, currCrontab)
}

function normalizeTasks(tasks: CrontabTask) {
  let idIdx = 0
  // attributes all tasks share
  const taskMeta = { id: 10, status: 'idle', startedAt: null, endedAt: null }

  /* Make sure all task-IDs are unique */
  const incId = () => (idIdx += 1)

  const normalizeTask = (act, id, _) => R.mergeRight(taskMeta, { id: incId(), act: act, target: id })

  return R.mapObjIndexed(normalizeTask, tasks)
}

function debugPrettyCrontab(ct: Crontab) {
  return R.map(R.pick(['jobId', 'repeat', 'at', 'scheduled', 'running', 'lastRun', 'createdAt']))(ct)
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
  debugPrettyCrontab,
}
