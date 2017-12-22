/* @flow */
import type { ServerState } from './types';

import config from './config';
import createBusStreams from './busStreams';
import { addrMapToConsole } from './lib/debug';
import getClient from './client';
import logger from 'debug';
import publish from './server';
import setupCron from './cron';
import setupScenes from './scenes';
import startServices from './services';

const debug = logger('smt:backend:main'),
  error = logger('error');

// Allow for clean restarts (e.g. when using pm2 or other process managers)
const setupCleanupHandler = client => {
  process.on('SIGINT', () => {
    debug('Received SIGINT. Cleaning up and exiting...');
    client.close();
    process.exit();
  });
};

/* PENDING / DEBUGGING: Enable better debugging until we're stable here */
process.on('unhandledRejection', r => error(r));
const clientConnect$ = getClient(config);

const { busEvent$, busState$ } = createBusStreams();

// Start bus-services, like setting the current time on the (knx-) bus
startServices();

/* Should be connected to backend / deepstreamIO before continuing... */
clientConnect$.observe({
  value(client) {
    // On reload/restarts/interrupt cleanup state
    setupCleanupHandler(client);

    // Load scenes from definitions-file and sync them to cloud, so other clients/frontends may use and invoke them
    const scenes = setupScenes(client);

    const serverState: ServerState = {
      conf: config,
      streams: {
        busEvent$,
        busState$,
      },
      client,
      scenes,
    };

    /* Init + start chronological rules engine, including syncing with cloud */
    setupCron(serverState);

    /* Setup and configure (websocket-/http-) server and pass event-emitters along
       for use in plugins et. al. */
    publish(serverState);

    debug('Server initialized and up running');

    /* Start the stream by logging from it */
    if (config.knxd.isAvailable) {
      busState$.map(addrMapToConsole);
    }
  },
  error(error) {
    error('Connection error to deepstream-server occured:');
    error(error);
  },
  end() {
    debug('deepstream-server connection established');
  },
});
