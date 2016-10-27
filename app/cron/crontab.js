import R from 'ramda';

const idIdxStart = 1;

const crontab = [
  {
    jobId: 1,
    name: 'sample-1',
    at: '01:00',
    repeat: 'daily',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [
      {targets: ['1/1/1', '1/1/2'], act: 'off'},
      {targets: ['2/2/2', '2/2/3'], act: 'on'},
    ],
  },
  {
    jobId: 2,
    name: 'sample-2',
    at: '07:00',
    repeat: 'hourly',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [
      {targets: ['3/3/3', '3/3/4'], act: 'off'}
    ]
  }
];

const taskMeta = {id: 10, status: null, startedAt: null, endedAt: null};

function loadCrontab() {
  const evolveTasks = task => R.fromPairs(R.map(t => ['target', t], task.targets));

  return R.pipe(
    R.map(j =>
      R.assoc('tasks', R.map(evolveTasks, j.tasks), j)
    ),
    R.tap(v => console.log(v)),
    //     R.map(evolveTasks)
    /* TODO */
  )(crontab);
}

export default loadCrontab;
