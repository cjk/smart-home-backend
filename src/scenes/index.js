// @flow

import type { Scenes } from '../types'

import loadScenes from './scene-definitions'
import syncToCloud from './syncToCloud'
import { logger } from '../lib/debug'

const log = logger('backend:scenes')

/* Load and transform initial scenes entries */
function setupScenes(client: Function): Scenes {
  const initialScenes = loadScenes()
  log.debug(`[Scenes] Loaded scenes with ${initialScenes.length} entries`)

  syncToCloud(client, initialScenes)
  return initialScenes
}

export default setupScenes
