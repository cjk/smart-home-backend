import {EventEmitter} from 'events';
import R, {map, tap, pluck, assoc, merge, filter, compose, pipe, head, prop, props, propEq, isEmpty, not} from 'ramda';
import K from 'kefir';
import schedule from './schedule';
import loadCrontab from './crontab';

const scheduled = j => j.scheduled;
const running = j => j.running;

const scheduledJobIds = compose(
  pluck('jobId'),
  filter(running)
);
const runningJobIds = compose(
  pluck('jobId'),
  filter(scheduled)
);

/* Simulated fake async operation */
const writeGroupAddr = (addr, cb) => {
  console.log(`Writing address ${JSON.stringify(addr)}...`);
  setTimeout(() => {
    console.log(`Address ${JSON.stringify(addr)} written:`);
    cb(null, addr);
  }, 1000);
};

const _crontab = loadCrontab();
console.log(`Loaded crontab:\n <${JSON.stringify(_crontab)}>`);

function init(busState$) {
  const cron$ = K.withInterval(3000, (emitter) => {
    emitter.emit(_crontab);
  });

  const eventEmitter = new EventEmitter();

  /* TODO: Define action-result-stream that emits completed rules so we can set running=false in our state */
  const actionResult$ = K.fromEvents(eventEmitter, 'actionFinished').toProperty(() => {});

  const createAddrWriteStream = addr => K.fromNodeCallback((callback) => {
    writeGroupAddr(addr, callback);
  });

  /* Sideeffects routine */
  const onValue = ({crontab, results}) => {
    console.log(`[Results-onValue] ${JSON.stringify(results)}`);

    console.log(`[onValue] <${scheduledJobIds(crontab)}> jobs scheduled.`);
    console.log(`[onValue] <${runningJobIds(crontab)}> jobs running.`);

    if (!isEmpty(scheduledJobIds(crontab))) {
      console.log(`Scheduled jobs: ${JSON.stringify(scheduledJobIds(crontab))}`);
    }

    const firstScheduledTask = pipe(
      filter(scheduled),
      head,
      prop('tasks'),
      head,
    );

    const taskStart = {status: 'started', startedAt: Date.now()};

    if (!isEmpty(scheduledJobIds(crontab))) {
      const task = firstScheduledTask(crontab);
      const result$ = createAddrWriteStream(merge(task, taskStart));

      /* TODO: Need to trigger the action-results stream with done rule-id */
      //     result$.flatMap(v => console.log(`got ${v}`));
      result$.onValue((taskState) => { console.log(`[result$] ${JSON.stringify(taskState)}`); eventEmitter.emit('actionFinished', taskState); });
    }
  };
  /* END of sideeffects */

  return K.combine([cron$, actionResult$], [busState$], (crontab, results, state) => {
    /* PENDING: No logic here yet */
    return {crontab, results, state};
  }).scan((prev, cur) => {
    const {crontab, state, results} = cur;

    console.log(`[Results-In-Stream] ${JSON.stringify(results)}`);

    const syncWithPrevJobs = map((j) => {
      const prevJob = R.find(R.propEq('jobId', j.jobId), prev.crontab);
      if (!prevJob) {
        /* TODO: Make sure returning nothing is OK here! */
        return j;
      }
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

    const newState = assoc('crontab', initiateJobs(schedCrontab), cur);

    console.log(`<${scheduledJobIds(newState.crontab)}> jobs scheduled.`);
    console.log(`<${runningJobIds(newState.crontab)}> jobs running.`);

    console.log(`[finalSchedule]: ${JSON.stringify(newState.crontab)}`);

    //     console.log(`action-1: ${JSON.stringify(R.fromPairs([[1, [{'act':'off','id':1,'status':null,'startedAt':null,'endedAt':null,'target':'1/1/1'}, {'act':'off','id':1,'status':null,'startedAt':null,'endedAt':null,'target':'1/1/2'}]]]))}`);

    return newState;
  }).observe(onValue);
}

export default init;
