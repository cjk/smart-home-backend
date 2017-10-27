// @flow
import type { Scenes } from '../types';

import { assoc, map } from 'ramda';
import { normalizeTasks } from '../cron/util';

const scenes: Scenes = [
  {
    id: 'scene/Abendessen',
    name: 'Abendessen',
    lastRun: null,
    tasks: [
      { targets: ['1/2/13', '1/2/15'], act: 'on' },
    ],
  },
  {
    id: 'scene/Frühstück',
    name: 'Frühstück',
    lastRun: null,
    tasks: [
      { targets: ['80/1/1', '80/1/2'], act: 'on' },
      { targets: ['90/1/1', '90/1/2'], act: 'off' },
    ],
  },
  {
    id: 'scene/Arbeiten',
    name: 'Arbeiten',
    lastRun: null,
    tasks: [{ targets: ['1/1/7'], act: 'on' }],
  },
];

/* Normalizes scene-task-structure
 *
 * Since we're using the cron-module's tasks for activating scene-actors, we need to setup our task-structures accordingly:
 * Each task-target is extracted into it's own task-entry and enriched with meta-attributes
 *
 */
function loadScenes() {
  return map(j => assoc('tasks', normalizeTasks(j.tasks), j), scenes);
}

export default loadScenes;
