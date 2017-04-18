import type { BusState } from '../types';
import K from 'kefir';
import { createTaskEventStream, processTaskEvents } from './taskProcessor';
import scheduleTick from './schedule';
import streamFromCloud from './streamFromCloud';

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000;

export default function init({
  streams: { busState$ },
  client,
}: { streams: { busState$: BusState }, client: Function }) {
  const tick$ = K.interval(tickInterval, 1);
  const crontabFromCloud$ = streamFromCloud(client);

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
      (crontab, taskEvents, state) => ({ crontab, taskEvents, state })
    )
      /* Jobs and tasks get synced (from last tick), scheduled and (indirectly) run from here: */
      .scan(scheduleTick)
      /* Subscribe to cron-stream and return a Subscription object for handling unsubscribe - see
       http://rpominov.github.io/kefir/#observe */
      .observe(processTaskEvents())
  );
}
