// @flow

// Our garbage collector works by finding "dead" (=ended) one-off jobs in our crontab and removes them "in the cloud",
// i.e. deepstream, our distributed network-data-store.
// This change then automatically propagates through our #syncWithCloud routines that execute those changes to our local crontab-stream!

import type { TickState } from '../types';

import R, { and, compose, converge, filter, isEmpty, join, map, pick, prop, propEq } from 'ramda';
import { logger } from '../lib/debug';

const log = logger('backend:cron-gc');

export default function garbageCollect(prev: TickState, next: TickState) {
  const p = prev.crontab;
  const c = next.crontab;
  const { client } = next;

  // Was there a running job in last tick?
  const isTempJob = propEq('repeat', 'oneShot');
  const isRunning = propEq('running', true);
  const notRunning = propEq('running', false);

  // TODO: Instead of #converge use #allPass
  const runningTemporaryJobs = converge(and, [isTempJob, isRunning]);
  const endedTemporaryJobs = converge(and, [isTempJob, notRunning]);

  const pastRunningJobIds = compose(map(pick(['jobId'])), filter(runningTemporaryJobs))(p);

  // nothing to clean up?
  if (isEmpty(pastRunningJobIds)) return next;

  // log.debug(pastRunningJobIds);

  const presentEndedOneshots = compose(map(pick(['jobId'])), filter(endedTemporaryJobs))(c);

  const garbageJobIds = map(prop('jobId'), R.intersection(pastRunningJobIds, presentEndedOneshots));

  if (isEmpty(garbageJobIds)) return next;

  log.debug(`Removing task(s) <${join('|', garbageJobIds)}> from crontab`);

  // Propagate crontab-changes to network-data-store aka "cloud":
  client.record.getList('smartHome/cronjobs').whenReady(lst => {
    lst.removeEntry(R.head(garbageJobIds));
  });

  return next;
}
