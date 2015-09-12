import IO from 'socket.io';
import handleEvents from './handleEvents';
import handleInitialState from './handleInitialState';
import handleBusWrites from './handleBusWrites';

let register = function(server, options, next) {

  const io = IO(server.select('busHandler').listener),
        eventHandler = handleEvents()(io),
        busEvents = options.busEmitter,
        busState = options.busState;

  io.on('connection', function(socket) {
    // console.log('Got a WS-connection');

    /* Send current bus-state to client on demand */
    socket.on('initialstate', handleInitialState(socket, busState), (err) => {
      console.log('Oops, error occurred while answering to <initialstate> request: ', err);
    });

    socket.on('writeToBus', handleBusWrites(socket), (err) => {
      console.log('Oops, error occurred while answering to <writeToBus> request: ', err);
    });

    // socket.emit('news', 'Hello from server!');
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
