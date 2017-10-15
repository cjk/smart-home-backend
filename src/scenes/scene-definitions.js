// @flow
import type { Scenes } from '../types';

import { assoc, map } from 'ramda';
import { normalizeTasks } from '../cron/util';

const scenes: Scenes = [
  {
    id: 'scene/Abendessen-1',
    name: 'Abendessen #1',
    lastRun: null,
    tasks: [
      { targets: ['10/1/1', '10/1/2'], act: 'off' },
      { targets: ['20/1/1', '20/1/2'], act: 'on' },
    ],
  },
  {
    id: 'scene/Frühstück-1',
    name: 'Frühstück #1',
    lastRun: null,
    tasks: [
      { targets: ['80/1/1', '80/1/2'], act: 'off' },
      { targets: ['90/1/1', '90/1/2'], act: 'off' },
    ],
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
