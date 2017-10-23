// @flow
import type { TickState } from '../types';

import logger from 'debug';
import { filter, propEq } from 'ramda';

const debug = logger('smt:cron');

export default function garbageCollect(prev: TickState, next: TickState) {
  const p = prev.crontab;
  const c = next.crontab;

  // Was there a running job in last tick?
  const isRunning = propEq('running', true);

  debug(filter(isRunning, p));

  return next;
}
