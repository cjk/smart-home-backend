/* @flow */
import config from './config';
import createBusStreams from './streams/bus';
import { addrMapToConsole } from './lib/debug';
import getClient from './client';
import logger from 'debug';
import publish from './server';
import setupCron from './cron';
import setupScenes from './scenes';

const debug = logger('smt:backend'),
  error = logger('error');

/* PENDING / DEBUGGING: Enable better debugging until we're stable here */
process.on('unhandledRejection', r => error(r));

const clientConnect$ = getClient(config);

const { busEvent$, busState$ } = createBusStreams();

/* Should be connected to backend / deepstreamIO before continuing... */
clientConnect$.observe({
  value(client) {
    // Load scenes from definitions-file and sync them to cloud, so other clients/frontends may use and invoke them
    const scenes = setupScenes(client);

    const appState = {
      conf: config,
      streams: {
        busEvent$,
        busState$,
      },
      client,
      scenes,
    };

    /* Init + start chronological rules engine, including syncing with cloud */
    setupCron(appState);

    /* Setup and configure (websocket-/http-) server and pass event-emitters along
       for use in plugins et. al. */
    publish(appState);

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
