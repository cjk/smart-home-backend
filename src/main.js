import config from './config';
import createBusStreams from './streams/bus';
import addrMapToConsole from './lib/debug';
import server from './server';
import cron from './cron';

const {busEvents, busState} = createBusStreams();

/* Init + start chronologial rules engine */
cron(busState);

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
  busState.map(addrMapToConsole).log();
}
