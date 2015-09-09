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
});
/* Create another stream only for events that carry a value, i.e. mutates our bus-state */
const mutatingBusEvents = busEvents.filter(e => mutatingEvents.contains(e.action));

const busState = mutatingBusEvents.scan((prev, event) => {
  const currentState = prev,
        addr = currentState.find(addr => addr.get('id') === event.dest);

  if (!addr)
    return currentState;

  return currentState.set(currentState.indexOf(addr), addr.set('value', event.value));
}, initialstate);

busState.log();

const busMonitor = Kefir.zip([mutatingBusEvents, busState]);

/* Setup and configure (websocket-/http-) server and pass event-emitters along
   for use in plugins et. al. */
server({conf: config.server, busEmitter: busEvents, busState: busState});
console.log('Server initialized and ready to run.');

/* Also locally log each KNX-bus event to the console */
busEvents.log();

// busMonitor.log();
