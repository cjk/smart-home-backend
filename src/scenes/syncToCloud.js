// @flow
import type { Scenes } from '../types';

import logger from 'debug';
import { map } from 'ramda';

const debug = logger('smt-scenes');

function syncToCloud(client: Function, scenes: Scenes) {
  const sceneLst = client.record.getList('smartHome/scenes');
  sceneLst.setEntries([]);

  debug('Now syncing local scenes to cloud!');
  map(scene => {
    const newSceneRecord = client.record.getRecord(scene.id);
    newSceneRecord.whenReady(record => {
      record.set(scene);
      sceneLst.addEntry(scene.id);
      // DEBUG
      // console.log(`[SceneCloud] Record set to ${JSON.stringify(scene)} `);
    });
    return scene;
  })(scenes);
}

export default syncToCloud;
