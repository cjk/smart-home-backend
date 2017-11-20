// @flow

import { assoc, map } from 'ramda';

import type { Crontab } from '../types';
import { normalizeTasks } from './util';

// Some default / example tasks
// The following task-types are scheduled and dispatched automatically:
// - Tasks with repeat='daily' and at='<current date+time>' - task remains in crontab and is executed every 24h
// - Tasks with repeat='oneShot' and at='<current date+time>' - task is removed from crontab after expiration

const crontab: Crontab = [
  {
    jobId: 'cronjobs/j1esevoj-1bcxxoucnq2',
    name: 'sample-1',
    at: '12:15:30',
    repeat: 'daily',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [
      { targets: ['1/1/1', '1/1/2'], act: 'off' },
      { targets: ['2/2/2', '2/2/3'], act: 'on' },
    ],
  },
  {
    jobId: 'cronjobs/j1esevoj-2nhotlynd8i',
    name: 'Auto-Aus Wohnzimmer Nachts',
    at: '23:30:00',
    repeat: 'daily',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [
      {
        targets: [
          '11/1/0',
          '1/2/15',
          '1/2/10',
          '1/2/5',
          '1/2/3',
          '1/2/12',
          '1/2/14',
          '1/2/5',
          '1/2/13',
          '1/2/7',
          '1/2/1',
          '1/2/4',
        ],
        act: 'off',
      },
    ],
  },
  {
    jobId: 'cronjobs/j1esevoj-3pf3chcujrg',
    name: 'Hobby-Licht Auto',
    at: '15:30:00',
    repeat: 'none',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: [{ targets: ['1/1/7'], act: 'off' }],
  },
];

/* Normalizes crontab-structure
 *
 * - Each task-target is extracted into it's own task-entry and enriched with meta-attributes
 *
 */
function loadCrontab() {
  return map(j => assoc('tasks', normalizeTasks(j.tasks), j), crontab);
}

export default loadCrontab;
