// @flow

// Our garbage collector works by finding "dead" (=ended) one-off jobs in our crontab and removes them "in the cloud",
// i.e. deepstream, our distributed network-data-store.
// This change then automatically propagates through our #syncWithCloud routines that execute those changes to our local crontab-stream!

import type { TickState } from '../types'

import * as R from 'ramda'
import { logger } from '../lib/debug'

const log = logger('backend:cron-gc')

export default function garbageCollect(store: any, tickState: TickState) {
  const isTempJob = R.propEq('repeat', 'oneShot')
  const notRunning = R.propEq('running', false)
  // Temporary jobs older than 10 seconds are expired
  const isExpired = j => Date.now() - j.createdAt > 10000

  const { crontab } = tickState

  const garbageJobs = R.filter(j => isTempJob(j) && notRunning(j) && isExpired(j), crontab)

  if (R.isEmpty(garbageJobs)) return tickState

  log.debug(`----> Removing task(s) <${R.join('|', R.pluck('jobId', garbageJobs))}> from crontab`)

  R.forEach(
    jobId =>
      store
        .crontabNode()
        .get(jobId)
        .put(null),
    R.pluck('jobId', garbageJobs)
  )

  const jobCmp = (j1, j2) => j1.jobId === j2.jobId

  return R.assoc('crontab', R.differenceWith(jobCmp, crontab, garbageJobs), tickState)
}
