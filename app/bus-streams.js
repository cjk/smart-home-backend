import config from './config';
import immutable, {List} from 'immutable';

import Kefir from 'kefir';

import {knxListender} from './knx';

export default function createBusStreams() {

  const {addresses, readableAddr} = config.knx;

  /* Takes the current bus-state and an event, applies the changes the event
     implies and returns the new bus-state */
  function updateFromEvent(currentState, event) {
    const addr = currentState.find(addr => addr.get('id') === event.dest);

    if (!addr)
      return currentState;

    return currentState.set(currentState.indexOf(addr), addr.set('value', event.value));
  };

  /* From all groupaddresses, returns only those with a readable-flag set (see
     config.knx.readableAddr) */
  function initialStateOnlyForReadableAddr(addresses) {
    const addressFilter = new List(readableAddr);

    return immutable.fromJS(addresses).filter(addr => addressFilter.contains(addr.get('id')));
  }

  const initialstate = initialStateOnlyForReadableAddr(addresses),
        mutatingEvents = new List(['write', 'response']);

  /* 1. Create stream to capture *all* KNX-bus events */
  const busEvents = Kefir.stream((emitter) => {
    knxListender(emitter);
  });

  /* Create another (sub-) stream only for events that carry a value, i.e. mutate our bus-state */
  const mutatingBusEvents = busEvents.filter(e => mutatingEvents.contains(e.action));

  /* Create a modified (property-) stream derived from busState by applying an
     event-delta when events come in from the bus-events-stream.
     This reflects our bus-state changing over time.
   */
  const busState = mutatingBusEvents.scan(updateFromEvent, initialstate);

  /* Not needed yet: Combinded stream of all that's going on on the home-bus */
  // const busMonitor = Kefir.zip([mutatingBusEvents, busState]);

  /* for DEBUGGING: Also locally log each KNX-bus event to the console */
  busEvents.log();
  busState.log();
  // busMonitor.log();

  return {
    busEvents: busEvents,
    busState: busState
  };
}
