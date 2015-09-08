import config from './config';
import immutable, {List} from 'immutable';

import Kefir from 'kefir';

import {knxListender} from './knx';

import server from './server';

const {addresses, readableAddr} = config.knx,
  addressFilter = new List(readableAddr),
  initialstate = immutable.fromJS(addresses).filter(addr => addressFilter.contains(addr.get('id'))),
  mutatingEvents = new List(['write', 'response']);

/* Captures *all* KNX-bus events */
const busEvents = Kefir.stream((emitter) => {
  knxListender(emitter);
}),
/* Create another stream only for events that carry a value, i.e. mutates our bus-state */
  mutatingBusEvents = busEvents.filter(e => mutatingEvents.contains(e.action));

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({conf: config.server, busEmitter: busEvents});
console.log('Server initialized and ready to run.');

const busState = mutatingBusEvents.scan((currentState, event) => {
  const addr = currentState.find(addr => addr.get('id') === event.dest);
  // console.log('Updating address: ', addr);

  return currentState.set(currentState.indexOf(addr), addr.set('value', event.value));
}, initialstate);

const busMonitor = Kefir.zip([mutatingBusEvents, busState]);

/* Also locally log each KNX-bus event to the console */
// busEvents.log();

busMonitor.log();
