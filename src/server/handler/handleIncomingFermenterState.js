/* eslint no-console: "off" */

/* Listens to state-events from our fermenter-closet (via Websockets) and
   transforms those events into an fermenter-state-event stream. */
import createFermenterStateStream from '../../streams/fermenterState';

function handleIncomingFermenterState(io) {
  const fermenter = io.of('/fermenter');
  return createFermenterStateStream(fermenter);
}

export default handleIncomingFermenterState;
