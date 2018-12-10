// @flow

import type { Scenes } from '../types'

import loadScenes from './scene-definitions'
import { logger } from '../lib/debug'

const log = logger('backend:scenes')

/* Load and transform initial scenes entries */
function setupScenes(): Scenes {
  const initialScenes = loadScenes()
  log.debug(`[Scenes] Loaded scenes with ${initialScenes.length} entries`)

  return initialScenes
}

export default setupScenes
