import K from 'kefir';
import loadCrontab from './crontab';
import {createTaskEventStream, processTaskEvents} from './taskProcessor';
import prepareSchedule from './schedule';

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

function init(busState$) {
  const cron$ = K.withInterval(1000, (emitter) => {
    emitter.emit(_crontab);
  });

  const taskEvent$ = createTaskEventStream();

  return K
    .combine([cron$, taskEvent$], [busState$], (crontab, taskEvents, state) => {
      /* PENDING: No logic here yet */
      console.log(`PING: ${Date.now()}`);
      return {crontab, taskEvents, state};
    })
    .scan(prepareSchedule)
    .observe(processTaskEvents());
}

export default init;
