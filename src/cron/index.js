/* @flow */
import type { Observable } from 'kefir';
import type { Crontab, ServerState, TickState } from '../types';

// import logger from 'debug';
// import { debugPrettyCrontab } from './util';

import K from 'kefir';
import { createTaskEventStream, processTaskEvents } from './taskProcessor';
import scheduleTick from './schedule';
import { syncCrontabWithCloud, pushJobToCloud } from './cloudSync';
import garbageCollect from './garbageCollector';
import { differenceWith, isEmpty } from 'ramda';

// const debug = logger('smt:cron-tick');

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000;

const eqJobs = (j1, j2) =>
  j1.lastRun === j2.lastRun &&
  j1.running === j2.running &&
  j1.scheduled === j2.scheduled;

export default function init({ streams: { busState$ }, client }: ServerState) {
  const tick$: Observable<number> = K.interval(tickInterval, 1);
  const crontabFromCloud$: Observable<Crontab> = syncCrontabWithCloud(client);

  const crontick$ = K.combine(
    [tick$],
    [crontabFromCloud$],
    (tick, crontab) => crontab
  );

  const taskEvent$ = createTaskEventStream();

  return (
    K.combine(
      [crontick$, taskEvent$],
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
      // Compare cronjobs for changes since last tick and update changed jobs to cloud
      .scan((prev, cur) => {
        const cp = prev.crontab;
        const cc = cur.crontab;
        //         debug(`Comparing cronjobs: ${R.differenceWith(eqJobs, cc, cp)}`);
        const changedJobs = differenceWith(eqJobs, cc, cp);
        if (!isEmpty(changedJobs)) pushJobToCloud(client, changedJobs);
        return cur;
      })
      // DEBUG
      //     .onValue(({ crontab }) => debug(debugPrettyCrontab(crontab)))
      /* Subscribe to cron-stream and return a subscription object (for handling unsubscribe) */
      .observe(processTaskEvents())
  );
}
