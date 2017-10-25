/* @flow */
import type { Observable } from 'kefir';
import type { BusState, Crontab, TickState } from '../types';

import logger from 'debug';
import { debugPrettyCrontab } from './util';

import K from 'kefir';
import { createTaskEventStream, processTaskEvents } from './taskProcessor';
import scheduleTick from './schedule';
import streamFromCloud from './streamFromCloud';
import garbageCollect from './garbageCollector';

const debug = logger('smt:cron-tick');

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000;

export default function init({
  streams: { busState$ },
  client,
}: {
  streams: { busState$: BusState },
  client: Function,
}) {
  const tick$: Observable<number> = K.interval(tickInterval, 1);
  const crontabFromCloud$: Observable<Crontab> = streamFromCloud(client);

  const crontick$ = K.combine(
    /* $FlowFixMe */
    [tick$],
    /* $FlowFixMe */
    [crontabFromCloud$],
    (tick, crontab) => crontab
  );

  const taskEvent$ = createTaskEventStream();

  return (
    K.combine(
      /* $FlowFixMe */
      [crontick$, taskEvent$],
      /* $FlowFixMe */
      [busState$],
      (crontab, taskEvents, state: TickState) => ({
        crontab,
        taskEvents,
        state,
        client,
      })
    )
      /* Jobs and tasks get synced (from last tick), scheduled and (indirectly) run from here: */
      .scan(scheduleTick)

      // Run garbage collector to remove ended one-shot jobs (like scene-actions, ...)
      .scan(garbageCollect)

      // DEBUG
      // .onValue(({ crontab }) => debug(debugPrettyCrontab(crontab)))

      /* Subscribe to cron-stream and return a subscription object (for handling unsubscribe) */
      .observe(processTaskEvents())
  );
}
