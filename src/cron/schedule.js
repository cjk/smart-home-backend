// @flow

/* This module takes a look at the crontab / list of tasks and schedules them according to their metadata.
 * Currently supported task-types:
 * - Daily tasks with explicit start time
 *
 * NOT yet supported task-types:
 * - Daily tasks without explicit start time (should automatically run at, let's say, midnight)
 * - Monthly tasks
 * - Dynamic tasks (created at runtime, like for ad-hoc actions)
 */
import type { TickState, CronJob, Crontab, Task, TaskEvent } from '../types.js'

import { differenceInHours, differenceInSeconds, format, parseISO } from 'date-fns'
import {
  __,
  assoc,
  cond,
  curry,
  find,
  findIndex,
  indexOf,
  isEmpty,
  isNil,
  map,
  pipe,
  prop,
  propEq,
  reduce,
  T,
  update,
} from 'ramda'
import { anyRunningTasks, onlyEndedTasks, setEnded, setLastRun, setRunning, withId } from './util.js'

import { logger } from '../lib/debug.js'

const log = logger('backend:cron')

const isDaily = propEq('repeat', 'daily')
const isOneShot = propEq('repeat', 'oneShot')
const notRunning = propEq('running', false)

const fixedTimeIsNow = (j: CronJob) => {
  const now = new Date()
  const lastRunTs = new Date(prop('lastRun', j))
  const noFixedTime = isNil(prop('at', j))
  const runNow = propEq('at', 'now', j)
  const hasRun = differenceInHours(now, lastRunTs) <= 23
  const isExpired = (j) => Date.now() - j.createdAt > 10000

  /* Bail on unsupported task-properties */
  if (noFixedTime || hasRun) return false

  if (isOneShot(j) && isExpired(j)) {
    log.debug(`WARNING: Not scheduling expired job <${j.jobId}>:`)
    log.debug(j)
    return false
  }

  // Some jobs are meant to be run immediately
  if (runNow) return true

  const targetTs = parseISO(format(now, `yyyy-MM-ddT${j.at}`))
  const secondsToStart = differenceInSeconds(targetTs, now)

  //   log.debug(`Job start-time delta for job <${j.jobId}> with TS <${targetTs}> is ${secondsToStart} seconds`);
  if (secondsToStart > -2 && secondsToStart <= 60 && secondsToStart % 5 === 0)
    log.debug(`Daily job #${j.jobId} will run in ${secondsToStart} seconds.`)

  return secondsToStart >= -2 && secondsToStart <= 1
}

const jobShouldRun = (j: CronJob) => {
  return (isDaily(j) || isOneShot(j)) && notRunning(j) && fixedTimeIsNow(j)
}

/* TODO: Out of place here, move to dispatcher?! */
const initiateJob = pipe(setRunning, setLastRun)

const setJobStateFromTasksState = (j: CronJob) =>
  cond([
    [anyRunningTasks, setRunning],
    [onlyEndedTasks, setEnded],
    [T, (job) => job] /* Default fallback: return job unchanged */,
  ])(j)

const updateTaskInJob = (job: CronJob, task: Task) =>
  pipe(
    findIndex(withId(task.id)),
    update(__, task, job.tasks),
    assoc('tasks', __, job),
    setJobStateFromTasksState
  )(job.tasks)

const updateTaskFromEvent = (event: TaskEvent, crontab: Crontab) => {
  const { jobId, ...task } = event
  const job = find(propEq('jobId', jobId), crontab)

  if (!job) return crontab

  /* Find the old task in the job, replace it with updated task and update job with new tasks. Then update job in given
     crontab and return it back */
  const newCrontab = updateTaskInJob(job, task)
  return update(indexOf(job, crontab), newCrontab, crontab)
}

/* Merge one or more task-events into it's corresponding job's tasks */
function _updateFromTaskEvents(taskEvents: Task, crontab: Crontab) {
  return reduce(
    (tab, event) => {
      if (isEmpty(event)) return tab

      return updateTaskFromEvent(event, tab)
    },
    crontab,
    taskEvents
  )
}
const updateFromTaskEvents = curry(_updateFromTaskEvents)

const schedule = (crontab: Crontab) => map((j) => assoc('scheduled', jobShouldRun(j), j))(crontab)

/* TICK-function called on each cron-timer iteration.
 * Brings over job-state from last tick. */
export default function scheduleTick(tickstate: TickState) {
  const { crontab, _state, taskEvents } = tickstate

  const newCrontab = pipe(schedule, updateFromTaskEvents(taskEvents))(crontab)

  /* Set scheduled jobs as running + lastRun-timestamp */
  const jobs = map((j) => (j.scheduled ? initiateJob(j) : j), newCrontab)

  /* Update state with new crontab */
  return assoc('crontab', jobs, tickstate)
}
