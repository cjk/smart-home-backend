/* @flow */
import config from './config';
import createBusStreams from './streams/bus';
import { addrMapToConsole } from './lib/debug';
import getClient from './client';
import publish from './server';
import setupCron from './cron';

/* PENDING: Enable better debugging until we're stable here */
process.on('unhandledRejection', r => console.log(r));

const clientConnect$ = getClient(config);

const { busEvent$, busState$ } = createBusStreams();

/* Should be connected to backend / deepstreamIO before continuing... */
clientConnect$.observe({
  value(connection) {
    /* Init + start chronological rules engine */
    setupCron({ busState$, connection });

    /* Setup and configure (websocket-/http-) server and pass event-emitters along
       for use in plugins et. al. */
    publish({
      conf: config,
      streams: {
        busEvent$,
        busState$,
      },
      connection,
    });

    console.log('Server initialized and ready to run.');

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
