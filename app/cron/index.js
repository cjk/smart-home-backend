import K from 'kefir';
import loadCrontab from './crontab';
import {createTaskResultStream, prepareCrontab, processTask} from './taskProcessor';

/* Load and transform initial crontab entries */
const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

function init(busState$) {
  const cron$ = K.withInterval(1000, (emitter) => {
    emitter.emit(_crontab);
  });

  const taskResult$ = createTaskResultStream();

  return K.combine([cron$, taskResult$], [busState$], (crontab, results, state) => {
    /* PENDING: No logic here yet */
    console.log(`PING: ${Date.now()}`);
    return {crontab, results, state};
  }).scan(prepareCrontab).observe(processTask());
}

export default init;
