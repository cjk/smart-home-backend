// @flow
import R from 'ramda';
import type {Crontab, TaskMeta} from '../../smart-home-backend.js.flow';

let idIdx = 0;

const crontab: Crontab = [
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
    at: null,
    repeat: 'hourly',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [
      {targets: ['3/3/3', '3/3/4'], act: 'off'}
    ]
  }
];

const taskMeta: TaskMeta = {id: 10, status: 'idle', startedAt: null, endedAt: null};

/* Normalizes crontab-structure
 *
 * - Each task-target is extracted into it's own task-entry and enriched with meta-attributes
 *
 */
function loadCrontab() {
  /* Each unfolded task get's it own, single task-property */
  const addTargetPropToTask = R.assoc('target');
  /* Targets-array is removed from task in favour of single target-property for each unfolded task */
  const removeTaskTargets = R.dissoc('targets');

  /* Not sure how to prevent this for now, but R.scan leaves it's initial object as is :( */
  const removeEmptyTasks = R.reject(R.isEmpty);

  /* Make sure all task-IDs are unique */
  const incId = () => (idIdx += 1);
  const uniqueId = R.map(t => R.assoc('id', incId(), t));

  const extractTasks = task => uniqueId(
    removeEmptyTasks(
      R.scan((acc, target) => R.merge(
        removeTaskTargets(task),
        R.merge(taskMeta, addTargetPropToTask(target, acc))
      ), {}, task.targets)
    )
  );

  return R.map(j =>
    R.assoc('tasks',
            R.flatten(
              R.map(extractTasks, j.tasks)), j)
  )(crontab);
}

export default loadCrontab;
