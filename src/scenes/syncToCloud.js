// @flow

import type { Scenes } from '../types';

import { map } from 'ramda';

function syncToCloud(client: Function, scenes: Scenes) {
  const sceneLst = client.record.getList('smartHome/scenes');
  sceneLst.setEntries([]);

  console.log('[SceneCloud] Now syncing local scenes to cloud!');
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
