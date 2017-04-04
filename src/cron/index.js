import type { BusState } from '../types';
import K from 'kefir';
import loadCrontab from './crontab';
import { createTaskEventStream, processTaskEvents } from './taskProcessor';
import scheduleTick from './schedule';

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000;

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`[CRON] Loaded crontab with ${_crontab.length} entries`);

function init(busState$: BusState) {
  const crontick$ = K.withInterval(tickInterval, emitter => {
    emitter.value(_crontab);
    /* NOTE: emitter.end() not defined yet! */
  });

  const taskEvent$ = createTaskEventStream();

  const cronEvents$ = K.combine(
    /* $FlowFixMe */
    [crontick$, taskEvent$],
    /* $FlowFixMe */
    [busState$],
    (crontab, taskEvents, state) => ({ crontab, taskEvents, state })
    /* PENDING: No logic here yet */
    //       console.log(`[cron]: PING: ${Date.now()}`);
  ).scan(scheduleTick);
  /* Enable for debugging the complete cron-state(s) */
  //     .log()

  return (
    cronEvents$
      /* Subscribe to cron-stream and return a Subscription object for handling unsubscribe - see
       http://rpominov.github.io/kefir/#observe */
      .observe(processTaskEvents())
  );
}

export default init;
