import type { BusState } from '../types';
import K from 'kefir';
import { createTaskEventStream, processTaskEvents } from './taskProcessor';
import scheduleTick from './schedule';
import streamFromCloud from './streamFromCloud';

/* How often to check crontab and schedule / dispatch jobs */
const tickInterval = 1000;

export default function init(
  {
    streams: { busState$ },
    client,
  }: { streams: { busState$: BusState }, client: Function }
) {
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
    // .scan((p, c) => {
    //   const { crontab: a } = p;
    //   const { crontab: b } = c;
       // console.log(`< ${JSON.stringify(a)}`);
       // console.log(`> ${JSON.stringify(b)}`);
    //        return p;

       // var inJ = (lst, id) => R.any(R.propEq('jobId', id))(lst);
       // var inJx = R.curry(inJ)

       // var inJ1 = inJx(v1)
       // var inJ2 = inJx(v2)

       // var isNew = (id) => (R.not(inJ1(id)) && inJ2(id));
       // var isRemoved = (id) => (inJ1(id) && R.not(inJ2(id)));
       // var isModified = (id) => (inJ1(id) && inJ2(id));

       // R.compose(R.pluck('jobId'), R.symmetricDifference)(v1, v2)
       // [ 2, 3, 3, 4, 5 ]
       // var jobIds = [ 2, 3, 4, 5 ]

       // R.reduceBy((acc, jobId) => acc.concat(jobId), [], (jobId) => (isNew(jobId) ? 'isNew' : isRemoved(jobId) ? 'isRemoved' : 'isModified'))
    //      })

    /* Subscribe to cron-stream and return a Subscription object for handling unsubscribe - see
       http://rpominov.github.io/kefir/#observe */
     .observe(processTaskEvents())
  );
}
