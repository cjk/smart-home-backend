// @flow

import { assoc, map } from 'ramda'

import type { Crontab } from '../types'
import { normalizeTasks } from './util'

// Some default / example tasks
// The following task-types are scheduled and dispatched automatically:
// - Tasks with repeat='daily' and at='<current date+time>' - task remains in crontab and is executed every 24h
// - Tasks with repeat='oneShot' and at='<current date+time>' - task is removed from crontab after expiration

const crontab: Crontab = [
  {
    jobId: 'cronjobs/j1esevoj-1bcxxoucnq2',
    name: 'Daniel Deckenleuchte - Nachts aus',
    at: '23:00:00',
    repeat: 'daily',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: { '1/3/1': 'off' },
  },
  {
    jobId: 'cronjobs/j1esevoj-2nhotlynd8i',
    name: 'Wohnzimmer Lichter - Nachts aus',
    at: '00:01:00',
    repeat: 'daily',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: {
      '11/1/0': 'off',
      '1/2/15': 'off',
      '1/2/10': 'off',
      '1/2/5': 'off',
      '1/2/3': 'off',
      '1/2/12': 'off',
      '1/2/14': 'off',
      '1/2/13': 'off',
      '1/2/7': 'off',
      '1/2/1': 'off',
      '1/2/4': 'off',
    },
  },
  {
    jobId: 'cronjobs/j1esevoj-3pf3chcujrg',
    name: 'Hobby-Licht Auto',
    at: '17:02:10',
    repeat: 'none',
    scheduled: false,
    running: false,
    lastRun: null,
    tasks: { '99/1/7': 'off' },
  },
]

/* Normalizes crontab-structure
 *
 * - Each task-target is extracted into it's own task-entry and enriched with meta-attributes
 *
 */
function loadCrontab(): Crontab {
  return map(j => assoc('tasks', normalizeTasks(j.tasks), j), crontab)
}

export default loadCrontab
