/* @flow */

import type { CronJob, Crontab } from '../types'

import K from 'kefir'
import loadCrontab from './crontab'
// import { debugPrettyCrontab } from './util';
import { append, join, map, pluck, prop, propEq, reject } from 'ramda'
import { logger } from '../lib/debug'

/* Flowtype definitions */
type NewJob = {
  added: CronJob,
}

type RemovedJob = {
  removed: string,
}

type ChangeSet = NewJob | RemovedJob

type CrontabChanges = {
  changes: ChangeSet,
  crontab: Crontab,
}

const log = logger('backend:cronCloudSync')

/* Load and transform initial crontab entries */
const initialCrontab = loadCrontab()
log.debug(`Loaded crontab with ${initialCrontab.length} entries`)

function syncCrontabWithCloud(client: Function) {
  const cronjobLst = client.record.getList('smartHome/cronjobs')
  cronjobLst.setEntries([])

  const addLstAddHndl = () =>
    K.stream(emitter => {
      cronjobLst.on('entry-added', jobId => {
        log.debug(`ADD of new cronjob with jobId <${jobId}> detected`)
        const newJobRec = client.record.getRecord(jobId)
        newJobRec.whenReady(record => emitter.emit({ added: record.get() }))
      })
    })

  /* Handle removed job-list entries */
  const addLstRemoveHndl = () =>
    K.stream(emitter => {
      cronjobLst.on('entry-removed', jobId => {
        log.debug(`REMOVE of new cronjob with jobId <${jobId}> detected`)
        emitter.emit({ removed: jobId })
      })
    })

  const syncToCloud = lst => {
    log.debug('Now syncing local crontab to cloud!')
    map(j => {
      const newJobRecord = client.record.getRecord(j.jobId)
      newJobRecord.whenReady(record => {
        record.set(j)
        lst.addEntry(j.jobId)
        // DEBUG
        // log.debug(`Record set to ${JSON.stringify(j)} `);
      })
      return j
    })(initialCrontab)
  }

  const cron$ = K.fromCallback(cb => {
    cronjobLst.whenReady(lst => {
      syncToCloud(lst)
      cb(lst)
    })
  }).flatMap(
    lst =>
      /* Handle added / remove job-list entries */
      K.merge([addLstAddHndl(), addLstRemoveHndl()]).scan((prev: Crontab, cur: CrontabChanges) => {
        const jobAdded = prop('added', cur)
        const jobIdRemoved = prop('removed', cur)
        if (jobAdded) {
          //           log.debug(`Adding job to crontab: ${JSON.stringify(jobAdded)}`);
          return append(jobAdded, prev)
        }
        if (jobIdRemoved) {
          //           log.debug(`Removing job from crontab: ${JSON.stringify(jobIdRemoved)}`);
          return reject(j => propEq('jobId', jobIdRemoved, j), prev)
        }
        return prev
      }, [])
    //       .spy('crontab')
  )

  /* TESTING + DEBUGGING */
  // setTimeout(() => {
  //   const newJobRecord = client.record.getRecord('fake/111');
  //   newJobRecord.whenReady(record => {
  //     record.set({ jobId: 'fake/111', type: 'tester' });
  //     cronjobLst.addEntry('fake/111');
  //     log.debug(
  //       `FAKE-Record set to ${JSON.stringify(newJobRecord.get())} `
  //     );
  //   });
  // }, 2000);
  // setTimeout(() => {
  //   const newJobRecord = client.record.getRecord('fake/222');
  //   newJobRecord.whenReady(record => {
  //     record.set({ jobId: 'fake/222', type: 'tester' });
  //     cronjobLst.addEntry('fake/222');
  //     log.debug(
  //       `FAKE-Record set to ${JSON.stringify(newJobRecord.get())} `
  //     );
  //   });
  // }, 3000);
  // setTimeout(() => {
  //   cronjobLst.removeEntry('fake/111');
  //   log.debug('FAKE-Record removed from list');
  // }, 5500);

  return cron$
}

function pushJobToCloud(client: Function, jobs: Array<CronJob>) {
  log.debug(`Syncing back job <${join(', ', pluck('name', jobs))}> to cloud.`)
  map(j => client.record.setData(j.jobId, j, err => log.debug(`Failed to update record ${j.name}: ${err}`)), jobs)
}

export { syncCrontabWithCloud, pushJobToCloud }
