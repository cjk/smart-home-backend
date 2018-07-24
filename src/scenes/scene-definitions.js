// @flow
import type { Scenes } from '../types'

import { assoc, map } from 'ramda'
import { normalizeTasks } from '../cron/util'

const scenes: Scenes = [
  {
    id: 'scene/Abends',
    name: 'Abends',
    tasks: [{ targets: ['1/2/13', '1/2/15'], act: 'on' }],
  },
  {
    id: 'scene/Abendessen',
    name: 'Abendessen',
    tasks: [{ targets: ['1/2/13', '1/2/15', '1/2/4', '1/2/7'], act: 'on' }],
  },
  {
    id: 'scene/Arbeiten',
    name: 'Arbeiten',
    tasks: [{ targets: ['1/1/7'], act: 'on' }],
  },
  {
    id: 'scene/Test001',
    name: 'Test-Szene',
    tasks: [{ targets: ['1/1/5'], act: 'on' }, { targets: ['1/1/6'], act: 'off' }],
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
