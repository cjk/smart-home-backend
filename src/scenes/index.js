// @flow

import type { Scenes } from '../types.js'

import loadScenes from './scene-definitions.js'
import { logger } from '../lib/debug.js'

const log = logger('backend:scenes')

/* Load and transform initial scenes entries */
function setupScenes(): Scenes {
  const initialScenes = loadScenes()
  log.debug(`[Scenes] Loaded scenes with ${initialScenes.length} entries`)

  return initialScenes
}

export default setupScenes
