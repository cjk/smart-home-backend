import handleEvents from './handleEvents';
import handleInitialState from './handleInitialState';
import handleIncomingFermenterState from './handleIncomingFermenterState.js';
import handleOutgoingFermenterState from './handleOutgoingFermenterState.js';
import handleBusWrites from './handleBusWrites';
import IO from 'socket.io';

const register = (server, options, next) => {
  const {busEvents, busState} = options.streams;

  const io = IO(server.select('busHandler').listener);

  /* Setup event-handlers for all the streams we've got: */

  /* TODO: Should refactor common functions inside these handlers like
     #createRequestStream, #sendState or #errorHandler */
  handleEvents(io, busEvents);
  handleInitialState(io, busState);

  /* Handle in- and out-going fermenter streams */
  const incomingFermenterState = handleIncomingFermenterState(io);
  handleOutgoingFermenterState(io, incomingFermenterState);

  /* Send received bus-write-request to the bus (without ACK, since the
     bus-write-event will be send to the client anyways) */
  handleBusWrites(io);

  next();
};

register.attributes = {
  name: 'bus-handler'
};

export default register;
