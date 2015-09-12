import handleEvents from './handleEvents';
import handleInitialState from './handleInitialState';
import handleBusWrites from './handleBusWrites';
import IO from 'socket.io';

let register = function(server, options, next) {

  const io = IO(server.select('busHandler').listener),
        eventHandler = handleEvents()(io),
        busEvents = options.busEmitter,
        busState = options.busState;

  io.on('connection', function(socket) {
    // console.log('Got a WS-connection');

    /* Send current bus-state to client on demand */
    handleInitialState(socket, busState);

    /* Send received bus-write-request to the bus (without ACK, since the
       bus-write-event will be send to the client anyways) */
    handleBusWrites(socket);
  });

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
