// @flow

import type { CronJob, Crontab, Store } from '../types'

import K from 'kefir'
import * as R from 'ramda'
import loadCrontab from './crontab'
// import { debugPrettyCrontab } from './util';
import { logger } from '../lib/debug'

type CrontabObj = {
  [string]: CronJob,
}

const log = logger('backend:cronCloudSync')

/* Load and transform initial crontab entries */
const initialCrontab: Crontab = loadCrontab()
log.debug(`Loaded crontab with ${initialCrontab.length} entries`)

function syncCrontabWithCloud(store: Store) {
  const crontabNode = store.crontabNode()

  const crontab: CrontabObj = R.reduce((acc, cronjob) => ({ [cronjob.jobId]: cronjob, ...acc }), {}, initialCrontab)

  // Experimental: Wait some time before starting cron-stream after setting remote/local crontab.
  // see also usage of #skipUntilBy below.
  const crontabWasStored = K.fromCallback(cb => crontabNode.put(crontab, cb())).delay(250)

  const cron$ = K.stream(jobEmitter => {
    crontabNode.map().once(
      job => {
        K.stream(taskEmitter =>
          crontabNode
            .get(job.jobId)
            .get('tasks')
            .map()
            .once(t => taskEmitter.emit(t))
        )
          .map(t => R.dissoc('_', t))
          .scan((tasks, task) => R.append(task, tasks), [])
          .onValue(tasks => jobEmitter.emit(R.assoc('tasks', tasks, R.dissoc('_', job))))
      },
      { change: true }
    )
    return () => crontabNode.map().off()
  }).scan((prevCrontab: Crontab, updJob: CronJob): Crontab => {
    const idx = R.indexOf(R.find(R.propEq('jobId', updJob.jobId), prevCrontab), prevCrontab)
    // // For DEBUGGING updated cron-jobs:
    // log.debug(`Job #${updJob.jobId} was updated: ${JSON.stringify(updJob)}`)
    return R.update(idx, updJob, prevCrontab)
  }, initialCrontab)

  // Allow Peer-graph to settle before start observing values
  return cron$.skipUntilBy(crontabWasStored)
}

// WIP/TODO:
function pushJobToCloud(store: any, jobs: Array<CronJob>) {
  log.debug(`Syncing back job <${R.join(', ', R.pluck('name', jobs))}> to cloud.`)
  // map(j => client.record.setData(j.jobId, j, err => log.debug(`Failed to update record ${j.name}: ${err}`)), jobs)
}

export { syncCrontabWithCloud, pushJobToCloud }
