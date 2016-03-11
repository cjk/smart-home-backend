import busScanner from './bus-scanner';
import config from './config';
import createBusStreams from './bus-streams';
import createFermenterStreams from './fermenterStreams.js';

import server from './server';

const {busEvents, busState} = createBusStreams();
const {fermenterState} = createFermenterStreams();

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({
  conf: config.server,
  streams: {
    busEvents: busEvents,
    busState: busState,
    fermenterState: fermenterState
  }
});

console.log('Server initialized and ready to run.');

const {readableAddr} = config.knx;

/* Start initial bus-scan for some well-known addresses  */
if (config.knxd.isAvailable) {
  busScanner(readableAddr);
  busState.log();
}
