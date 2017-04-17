/* @flow */
import K from 'kefir';
import loadCrontab from './crontab';
import { append, map, prop, propEq, reject } from 'ramda';
import type { CronJob, Crontab } from '../types';

/* Flowtype definitions */
type NewJob = {
  added: CronJob,
};

type RemovedJob = {
  removed: string,
};

type ChangeSet = NewJob | RemovedJob;

type CrontabChanges = {
  changes: ChangeSet,
  crontab: Crontab,
};

/* Load and transform initial crontab entries */
const initialCrontab = loadCrontab();
console.log(`[CronCloud] Loaded crontab with ${initialCrontab.length} entries`);

export default function createStream(client: Function) {
  const cronjobLst = client.record.getList('smartHome/cronjobs');
  cronjobLst.setEntries([]);

  const addLstAddHndl = () =>
    K.stream(emitter => {
      cronjobLst.on('entry-added', jobId => {
        console.log(
          `[CronCloud] ADD of new cronjob with jobId <${jobId}> detected`
        );
        const newJobRec = client.record.getRecord(jobId);
        newJobRec.whenReady(record => emitter.emit({ added: record.get() }));
      });
    });

  /* Handle removed job-list entries */
  const addLstRemoveHndl = () =>
    K.stream(emitter => {
      cronjobLst.on('entry-removed', jobId => {
        console.log(
          `[CronCloud] REMOVE of new cronjob with jobId <${jobId}> detected`
        );
        emitter.emit({ removed: jobId });
      });
    });

  const syncToCloud = lst => {
    console.log('[CronCloud] Now syncing local crontab to cloud!');
    map(j => {
      const newJobRecord = client.record.getRecord(j.jobId);
      newJobRecord.whenReady(record => {
        record.set(j);
        lst.addEntry(j.jobId);
        console.log(`[CronCloud] Record set to ${JSON.stringify(j)} `);
      });
      return j;
    })(initialCrontab);
  };

  const cron$ = K.fromCallback(cb => {
    cronjobLst.whenReady(lst => {
      syncToCloud(lst);
      cb(lst);
    });
  }).flatMap(
    lst =>
      /* Handle added / remove job-list entries */
      /* $FlowFixMe */
      K.merge([
        addLstAddHndl(),
        addLstRemoveHndl(),
      ]).scan((prev: Crontab, cur: CrontabChanges) => {
        const jobAdded = prop('added', cur);
        const jobIdRemoved = prop('removed', cur);
        if (jobAdded) {
          return append(jobAdded, prev);
        }
        if (jobIdRemoved) {
          return reject(j => propEq('jobId', jobIdRemoved, j), prev);
        }
        return prev;
      }, [])
    //     .spy('crontab')
  );

  /* TESTING + DEBUGGING */
  // setTimeout(() => {
  //   const newJobRecord = client.record.getRecord('fake/111');
  //   newJobRecord.whenReady(record => {
  //     record.set({ jobId: 'fake/111', type: 'tester' });
  //     cronjobLst.addEntry('fake/111');
  //     console.log(
  //       `[CronCloud] FAKE-Record set to ${JSON.stringify(newJobRecord.get())} `
  //     );
  //   });
  // }, 2000);
  // setTimeout(() => {
  //   const newJobRecord = client.record.getRecord('fake/222');
  //   newJobRecord.whenReady(record => {
  //     record.set({ jobId: 'fake/222', type: 'tester' });
  //     cronjobLst.addEntry('fake/222');
  //     console.log(
  //       `[CronCloud] FAKE-Record set to ${JSON.stringify(newJobRecord.get())} `
  //     );
  //   });
  // }, 3000);
  // setTimeout(() => {
  //   cronjobLst.removeEntry('fake/111');
  //   console.log('[CronCloud] FAKE-Record removed from list');
  // }, 5500);

  return cron$;
}
