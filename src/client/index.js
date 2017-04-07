import type { Config } from '../types';
import deepstream from 'deepstream.io-client-js';
import K from 'kefir';

function getClient$(config: Config) {
  const { wsServer } = config;

  return K.fromPromise(
    new Promise((resolve, reject) => {
      const client = deepstream(`${wsServer.host}:${wsServer.port}`).login(
        { username: wsServer.user },
        (success, data) => {
          if (success) {
            resolve(client);
          } else {
            reject(new Error('Failed to connect to deepstream-server!'));
          }
        }
      );
    })
  );
}

export default getClient$;
