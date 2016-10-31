import {EventEmitter} from 'events';
import R, {map, tap, assoc, merge, filter, compose, pipe, flatten, head, prop, props, propEq, isEmpty, not} from 'ramda';
import K from 'kefir';
import schedule from './schedule';
import loadCrontab from './crontab';

// const getWriteHandler = (_emitter) => (addr, cb) => {
//   console.log(`Writing address ${addr}.`);
//   setTimeout(() => _emitter.emit('foo'), 1000);
//   console.log(`Address ${addr} written`);
// };

const writeGroupAddr = (addr, cb) => {
  console.log(`Writing address ${JSON.stringify(addr)}...`);
  setTimeout(() => {
    console.log(`Address ${JSON.stringify(addr)} written:`);
    cb(null, addr);
  }, 1000);
};

const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

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

  /* Sideeffects routine */
  const onValue = ({crontab}) => {
    const scheduled = j => j.scheduled;
    const hasScheduledJobs = !isEmpty(filter(scheduled)(crontab));
    const onlyJobId = props(['jobId']);

    if (not(hasScheduledJobs)) {
      console.log('no jobs scheduled!');
      return;
    }

    const scheduledJobIds = compose(flatten, map(onlyJobId), filter(scheduled));
    console.log(`Running jobs ${JSON.stringify(scheduledJobIds(crontab))}`);

    const task = pipe(
      filter(scheduled),
      head,
      prop('tasks'),
      head,
    )(crontab);
    const result$ = createAddrWriteStream(task);

    /* TODO: Need to trigger the action-results stream with done rule-id */
    //     result$.flatMap(v => console.log(`got ${v}`));
    result$.onValue((v) => { console.log(v); eventEmitter.emit('actionFinished', task); });
  };
  /* END of sideeffects */

  return K.combine([$cron, $busState], [actionResult$], (crontab, state, results) => {
    /* PENDING: No logic here yet */
    return {crontab, state, results};
  }).scan((prev, cur) => {
    const {crontab, state, results} = cur;

    const syncWithPrevJobs = map((j) => {
      const prevJob = R.find(R.propEq('jobId', j.jobId), prev.crontab);
      if (!prevJob)
        /* TODO: Make sure returning nothing is OK here! */
        return j;
      return R.merge(j, R.pick(['running', 'scheduled'], prevJob));
    });

    console.log(`synced: ${JSON.stringify(syncWithPrevJobs(crontab))}`);
    //     const retainedCrontabContent = R.pick(['running'], prev.crontab);
    //     const crontab = merge(currentCrontab, retainedCrontabContent);

    const setRunning = assoc('running', true);

    /* TODO: Schedule jobs according to their time / interval prop, not their jobId */
    //     const schedule = map(j => (j.jobId === 1 ? assoc('scheduled', true, j) : j), crontab);
    const schedCrontab = schedule(syncWithPrevJobs(crontab));
    const scheduledJobs = filter(j => j.scheduled);

    const initiateJobs = R.pipe(
      scheduledJobs,
      R.adjust(setRunning, 0)
    );
    console.log(`crontab: ${JSON.stringify(initiateJobs(schedCrontab))}`);

    //     console.log(`action-1: ${JSON.stringify(R.fromPairs([[1, [{'act':'off','id':1,'status':null,'startedAt':null,'endedAt':null,'target':'1/1/1'}, {'act':'off','id':1,'status':null,'startedAt':null,'endedAt':null,'target':'1/1/2'}]]]))}`);

    return assoc('crontab', initiateJobs(schedCrontab), cur);
  }).observe(onValue);
}

export default init;
