import {EventEmitter} from 'events';
import {map, assoc, merge, filter, props, compose, flatten, head, propEq, find} from 'ramda';
import K from 'kefir';
import parse from './schedule';
import loadCrontab from './crontab';

// const getWriteHandler = (_emitter) => (addr, cb) => {
//   console.log(`Writing address ${addr}.`);
//   setTimeout(() => _emitter.emit('foo'), 1000);
//   console.log(`Address ${addr} written`);
// };

const writeGroupAddr = (addr, cb) => {
  console.log(`Writing address ${addr}...`);
  setTimeout(() => {
    console.log(`Address ${addr} written:`);
    cb(null, addr);
  }, 1000);
};

const _crontab = loadCrontab();
console.log(`Loaded crontab <${JSON.stringify(_crontab)}>`);

function init($busState) {
  const $cron = K.withInterval(3000, (emitter) => {
    emitter.emit(_crontab);
  });

  const eventEmitter = new EventEmitter();

  /* TODO: Define action-result-stream that emits completed rules so we can set running=false in our state */
  const actionResult$ = K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => ({action: 'nothing'}));

  const createAddrWriteStream = addr => K.fromNodeCallback((callback) => {
    writeGroupAddr(addr, callback);
  });

  const onValue = ({crontab}) => {
    const scheduled = j => j.scheduled;
    const onlyJobId = props(['jobId']);

    const scheduledJobIds = compose(flatten, map(onlyJobId), filter(scheduled));
    console.log(`Running jobs ${JSON.stringify(scheduledJobIds(crontab))}`);

    const task = head(filter(scheduled)(crontab));
    const result$ = createAddrWriteStream(task);
    /* TODO: Need to trigger the action-results stream with done rule-id */
    //     result$.flatMap(v => console.log(`got ${v}`));
    result$.onValue((v) => { console.log(v); eventEmitter.emit('actionFinished', task); });
  };

  return K.combine([$cron, $busState], [actionResult$], (crontab, state, results) => {
    /* Transform crontab to schedule */
    return {crontab, state, results};
  }).scan((prev, cur) => {
    const {crontab, state, results} = cur;
    const crontabOld = prev.crontab;

    /* TODO: Schedule jobs according to their time / interval prop, not their jobId */
    const schedule = map(j => (j.jobId === 1 ? assoc('scheduled', true, j) : j), crontab);

    // console.log(`crontab-0: ${JSON.stringify(crontabOld)}`);
    // console.log(`crontab-1: ${JSON.stringify(crontab)}`);
    // console.log(`action-1: ${JSON.stringify(results)}`);

    return assoc('crontab', schedule, cur);
  }).observe(onValue);
}

export default init;
