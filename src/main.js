/* @flow */
import config from './config';
import createBusStreams from './streams/bus';
import { addrMapToConsole } from './lib/debug';
import getClient from './client';
import publish from './server';
import setupCron from './cron';
import setupScenes from './scenes';

/* PENDING / DEBUGGING: Enable better debugging until we're stable here */
process.on('unhandledRejection', r => console.log(r));

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

    console.info('Server initialized and up running');

    /* Start the stream by logging from it */
    if (config.knxd.isAvailable) {
      busState$.map(addrMapToConsole).log();
    }
  },
  error(error) {
    console.error('[busServer] Connection error to deepstream-server occured:');
    console.error(error);
  },
  end() {
    console.info('[busServer] deepstream-server connection established');
  },
});
