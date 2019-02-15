// @flow

import type { CronJob, Crontab, Store } from '../types'

import K from 'kefir'
import * as R from 'ramda'
import loadCrontab from './crontab'
import { debugPrettyCrontab, normalizeTasks } from './util'
import { logger } from '../lib/debug'

type CrontabObj = {
  [string]: CronJob,
}

const log = logger('backend:cronCloudSync')

/* Load and transform initial crontab entries */
const initialCrontab: Crontab = loadCrontab()
log.debug(`Loaded crontab with ${initialCrontab.length} entries`)
// log.debug(initialCrontab)

function syncCrontabWithCloud(store: Store) {
  const crontabNode = store.crontabNode()

  const crontab: CrontabObj = R.reduce((acc, cronjob) => ({ [cronjob.jobId]: cronjob, ...acc }), {}, initialCrontab)

  // Experimental: Wait some time before starting cron-stream after setting remote/local crontab.
  // see also usage of #skipUntilBy below.
  const crontabWasStored = K.fromCallback(cb => crontabNode.put(crontab, cb())).delay(250)

  const cron$ = K.stream(jobEmitter => {
    crontabNode
      // filter out null -> deleted jobs until we someday actually garbage-collect them
      .map(j => (j === null ? undefined : j))
      // meaning we're listening to new cronjobs from the cloud, but not for changes in existing ones! (-> #on)
      .once(
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

// Write changes to jobs we modified locally back into cloud
function pushJobToCloud(store: any, jobs: Array<CronJob>) {
  log.debug(`Syncing back job <${R.join(', ', R.pluck('name', jobs))}> to cloud.`)
  R.pipe(
    R.map(j => R.assoc('tasks', normalizeTasks(j.tasks), j)),
    R.map(j => {
      store
        .crontabNode()
        .get(j.jobId)
        .put(j)
    })
  )(jobs)
}

export { syncCrontabWithCloud, pushJobToCloud }
