import Kefir from 'kefir';

const crontab = [
  {name: 'lights off late night', at: '01:00', repeat: 'daily'},
  {name: 'good morning!', at: '07:00', repeat: 'daily'}
];

function init($busState) {
  const $cron = Kefir.withInterval(10000, (emitter) => {
    emitter.emit(crontab);
  });

  return $busState.sampledBy($cron, (state, sched) => {
    console.log(`Checking schedule: <${sched}> against state ${state}`);
  });
}

export default init;
