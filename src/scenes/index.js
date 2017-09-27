// @flow

import loadScenes from './scene-definitions';
import syncToCloud from './syncToCloud';

import type { Scenes } from '../types';

/* Load and transform initial scenes entries */
function setupScenes(client): Scenes {
  const initialScenes = loadScenes();
  console.log(`[Scenes] Loaded scenes with ${initialScenes.length} entries`);

  syncToCloud(client, initialScenes);
  return initialScenes;
}

export default setupScenes;
