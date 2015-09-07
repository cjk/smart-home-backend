import Kefir from 'kefir';

import {knxListender} from './knx';

import server from './server';

/* Capture KNX-bus events */
const knxEvents = Kefir.stream((emitter) => {
  knxListender(emitter);
});

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({knxEmitter: knxEvents});

console.log('Server initialized and ready to run.');

/* Also locally log each KNX-bus event to the console */
knxEvents.log();
