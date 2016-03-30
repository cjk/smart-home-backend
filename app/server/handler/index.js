import handleEvents from './handleEvents';
import handleFermenterState from './handleFermenterState';
import handleInitialState from './handleInitialState';
import handleBusWrites from './handleBusWrites';
import IO from 'socket.io';

const register = function(server, options, next) {

  const {busEvents, busState, fermenterState} = options.streams;

  const io = IO(server.select('busHandler').listener),
        eventHandler = handleEvents()(io);

  io.on('connection', function(socket) {

    /* Send received bus-write-request to the bus (without ACK, since the
       bus-write-event will be send to the client anyways) */
    handleBusWrites(socket);

  });

  /* Send current bus-state to client on demand */
  handleInitialState(io, busState);

  handleFermenterState(io, fermenterState);

  io.on('disconnect', function() {
    busEvents.offValue(() => eventHandler());
  });

  busEvents.onValue(event => eventHandler(event));

  next();
};

register.attributes = {
  name: 'bus-handler'
};

export default register;
