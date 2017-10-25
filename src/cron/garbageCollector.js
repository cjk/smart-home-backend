// @flow
import type { TickState } from '../types';

import logger from 'debug';
import R, {
  and,
  compose,
  converge,
  head,
  isEmpty,
  filter,
  map,
  pick,
  prop,
  propEq,
  reject,
} from 'ramda';

const debug = logger('smt:cron');

export default function garbageCollect(prev: TickState, next: TickState) {
  const p = prev.crontab;
  const c = next.crontab;

  // Was there a running job in last tick?
  const isTempJob = propEq('repeat', 'oneShot');
  const isRunning = propEq('running', true);
  const notRunning = propEq('running', false);

  // TODO: Instead of #converge use #allPass
  const runningTemporaryJobs = converge(and, [isTempJob, isRunning]);
  const endedTemporaryJobs = converge(and, [isTempJob, notRunning]);

  const pastRunningJobIds = compose(
    map(pick(['jobId'])),
    filter(runningTemporaryJobs)
  )(p);

  // nothing to clean up?
  if (isEmpty(pastRunningJobIds)) return next;

  // debug(pastRunningJobIds);

  const presentEndedOneshots = compose(
    map(pick(['jobId'])),
    filter(endedTemporaryJobs)
  )(c);

  debug(
    compose(reject(R.__, next), propEq('jobId'), head)(
      R.intersection(pastRunningJobIds, presentEndedOneshots)
    )
  );

  const garbageJobIds = map(
    prop('jobId'),
    R.intersection(pastRunningJobIds, presentEndedOneshots)
  );

  if (isEmpty(garbageJobIds)) return next;
  // debug(presentEndedOneshots(c));

  // TODO: map((j => any(propEq('jobId', j.jobId), result)))(d)
  return next;
}
