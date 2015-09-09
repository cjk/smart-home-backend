import config from './config';
import createBusStreams from './bus-streams';
import server from './server';

const {busEvents, busState} = createBusStreams();

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({conf: config.server, busEmitter: busEvents, busState: busState});
console.log('Server initialized and ready to run.');
