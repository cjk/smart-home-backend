import busScanner from './bus-scanner';
import config from './config';
import createBusStreams from './bus-streams';
import server from './server';

const {busEvents, busState} = createBusStreams();

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({conf: config.server, busEmitter: busEvents, busState: busState});
console.log('Server initialized and ready to run.');

const {readableAddr} = config.knx;

busScanner(readableAddr);

// writeGroupAddr('1/1/7', '1');
