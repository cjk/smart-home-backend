/* @flow */
import type { Observable } from 'kefir'
import type { Crontab, ServerState, Store, TickState } from '../types.js'

import { syncWithPrevJobs } from './util.js'

import * as R from 'ramda'
import K from 'kefir'

import { createTaskEventStream, processTaskEvents } from './taskProcessor.js'
import scheduleTick from './schedule.js'
import { syncCrontabWithCloud, pushJobToCloud } from './cloudSync.js'
import cleanupCrontab from './garbageCollector.js'

// import { logger } from '../lib/debug'
// const log = logger('smt:cron-tick')

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000

const eqJobs = (j1, j2) => j1.lastRun === j2.lastRun && j1.running === j2.running && j1.scheduled === j2.scheduled

export default function init({ streams: { busState$ } }: ServerState, store: Store) {
  const cleanupCrontabWStore = R.curry(cleanupCrontab)(store)

  const tick$: Observable<number> = K.interval(tickInterval, 1)
  const crontabFromCloud$: Observable<Crontab> = syncCrontabWithCloud(store)

  const crontick$ = K.combine([tick$], [crontabFromCloud$], (tick, crontab) => crontab)

  const taskEvent$ = createTaskEventStream()

  return (
    K.combine([crontick$, taskEvent$], [busState$], (crontab, taskEvents, state: TickState) => ({
      crontab,
      taskEvents,
      state,
    }))
      // Jobs and tasks get synced (from last tick)
      .scan((prev, curr) => {
        const cleanTickstate = cleanupCrontabWStore(curr)
        return scheduleTick({ ...curr, crontab: syncWithPrevJobs(prev, cleanTickstate) })
      })

      // Compare cronjobs for changes since last tick and update changed jobs to cloud
      .scan((prev, curr) => {
        const { crontab: prevCrontab } = prev
        const { crontab: currCrontab } = curr

        const changedJobs = R.differenceWith(eqJobs, currCrontab, prevCrontab)
        if (!R.isEmpty(changedJobs)) pushJobToCloud(store, changedJobs)
        return curr
      })

      // DEBUG
      //       .onValue(({ crontab }) => log.debug(debugPrettyCrontab(crontab)))
      /* Subscribe to cron-stream and return a subscription object (for handling unsubscribe) */
      .observe(processTaskEvents())
  )
}
