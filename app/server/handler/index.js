import handleEvents from './handleEvents';
import handleFermenterState from './handleFermenterState';
import handleInitialState from './handleInitialState';
import handleBusWrites from './handleBusWrites';
import IO from 'socket.io';

const register = function(server, options, next) {

  const {busEvents, busState, fermenterState} = options.streams;

  const io = IO(server.select('busHandler').listener);

  /* Setup event-handlers for all the streams we've got: */
  /* TODO: Should refactor common functions inside these handlers like #createRequestStream, #sendState or #errorHandler */
  handleEvents(io, busEvents);
  handleInitialState(io, busState);
  handleFermenterState(io, fermenterState);
  /* Send received bus-write-request to the bus (without ACK, since the
     bus-write-event will be send to the client anyways) */
  handleBusWrites(io);

  next();
};

register.attributes = {
  name: 'bus-handler'
};

export default register;
