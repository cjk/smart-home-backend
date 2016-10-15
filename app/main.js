import config from './config';
import createBusStreams from './streams/bus';

import server from './server';

const {busEvents, busState} = createBusStreams();

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({
  conf: config.server,
  streams: {
    busEvents,
    busState,
  }
});

console.log('Server initialized and ready to run.');

/* Start the stream by logging from it */
if (config.knxd.isAvailable) {
  busState.log();
}
