// @flow
import type { Scenes } from '../types'

import { assoc, map } from 'ramda'
import { normalizeTasks } from '../cron/util'

const scenes: Scenes = [
  {
    id: 'scene/Abends',
    name: 'Abends',
    tasks: {
      '1/2/13': 'on',
      '1/2/15': 'on',
    },
  },
  {
    id: 'scene/Abendessen',
    name: 'Abendessen',
    tasks: {
      '1/2/13': 'on',
      '1/2/15': 'on',
      '1/2/4': 'on',
      '1/2/7': 'on',
    },
  },
  {
    id: 'scene/Arbeiten',
    name: 'Arbeiten',
    tasks: {
      '1/1/7': 'on',
    },
  },
  {
    id: 'scene/Test001',
    name: 'Test-Szene',
    tasks: {
      '1/1/5': 'on',
      '1/1/6': 'off',
    },
  },
]

/* Normalizes scene-task-structure
 *
 * Since we're using the cron-module's tasks for activating scene-actors, we need to setup our task-structures accordingly:
 * Each task-target is extracted into it's own task-entry and enriched with meta-attributes
 *
 */
function loadScenes() {
  return map(j => assoc('tasks', normalizeTasks(j.tasks), j), scenes)
}

export default loadScenes
