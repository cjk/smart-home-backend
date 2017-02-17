/* @flow */

import type { Config, BusState, BusEvent, ServerProps } from '../../types';
import type {Observable} from 'kefir';

import deepstream from 'deepstream.io-client-js';
import K from 'kefir';

import handleBusWrites from './handleBusWrites';
import handleBusEvents from './handleBusEvents';
import updateRemoteInitialState from './handleInitialState';

function busServer(props: ServerProps) {
  const {wsServer} = props.conf;
  const {busEvents, busState} = props.streams;

  const connectClient$ = K.fromPromise(new Promise((resolve, reject) => {
    const client = deepstream(`${wsServer.host}:${wsServer.port}`).login({username: wsServer.user}, (success, data) => {
      if (success) {
        resolve(client)
      } else {
        reject(new Error('Failed to connect to deepstream-server!'));
      }
    });
  }));

  /* Setup event-handlers for all bus-events / streams we've got: */
  const deepstreamService$ = connectClient$.observe({
    value(client) {
      updateRemoteInitialState(client, busState);
      handleBusWrites(client);
      handleBusEvents(client, busEvents);
    },
    error(error) {
      console.error(`[busServer] Connection error to deepstream-server occured:`);
      console.error(error);
    },
    end() {
      console.info(`[busServer] deepstream-server connection established`);
    }
  });

  /* TODO: When is this happening?! */
  //   deepstreamService$.unsubscribe();

}

export default busServer;
