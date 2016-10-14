import IO from 'socket.io';

import handleEvents from './handleEvents';
import handleInitialState from './handleInitialState';

import handleIncomingFermenterState from './handleIncomingFermenterState';
import handleOutgoingFermenterState from './handleOutgoingFermenterState';

import handleIncomingFermenterCommands from './handleIncomingFermenterCommands';
import handleOutgoingFermenterCommands from './handleOutgoingFermenterCommands';

import handleBusWrites from './handleBusWrites';

const register = (server, options, next) => {
  const {busEvents, busState} = options.streams;

  const io = IO(server.select('busHandler').listener);

  /* Setup event-handlers for all the streams we've got: */

  /* TODO: Should refactor common functions inside these handlers like
     #createRequestStream, #sendState or #errorHandler */
  handleEvents(io, busEvents);
  handleInitialState(io, busState);

  /* Handle in- and out-going fermenter state (streams) */
  const incomingFermenterState = handleIncomingFermenterState(io);
  handleOutgoingFermenterState(io, incomingFermenterState);

  /* Handle in- and out-going fermenter commands (streams) */
  const incomingFermenterCommands = handleIncomingFermenterCommands(io);
  handleOutgoingFermenterCommands(io, incomingFermenterCommands);

  /* Send received bus-write-request to the bus (without ACK, since the
     bus-write-event will be send to the client anyways) */
  handleBusWrites(io);

  io.on('connection', (socket) => {
    io.of('/').clients((err, clients) => {
      if (err) {
        console.warn('Error counting clients!');
        return err;
      }
      console.log(`################ Now connected clients: <${clients}>`);
      return clients;
    });
  });

  next();
};

register.attributes = {
  name: 'bus-handler'
};

export default register;
