// @flow

import logger from 'debug';
import loadScenes from './scene-definitions';
import syncToCloud from './syncToCloud';

import type { Scenes } from '../types';

const debug = logger('smt-scenes');

/* Load and transform initial scenes entries */
function setupScenes(client: Function): Scenes {
  const initialScenes = loadScenes();
  debug(`[Scenes] Loaded scenes with ${initialScenes.length} entries`);

  syncToCloud(client, initialScenes);
  return initialScenes;
}

export default setupScenes;
