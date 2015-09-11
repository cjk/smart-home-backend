import IO from 'socket.io';
import handleEvents from './handleEvents';

let register = function(server, options, next) {

  const io = IO(server.select('busHandler').listener),
        eventHandler = handleEvents()(io),
        busEvents = options.busEmitter,
        busState = options.busState;

  io.on('connection', function(socket) {
    // console.log('Got a WS-connection');

    io.on('disconnect', function() {
      busEvents.offValue(() => eventHandler());
    });

    /* Send current bus-state to client on demand */
    socket.on('initialstate', (request) => {
      busState.onValue((currentState) => socket.emit('initialstate', currentState));
    }, (err) => {
      console.log('Oops, error occurred while answering to <initialstate> request: ', err);
    });

    // socket.on('initialstate', Handlers.hello);
    // socket.emit('news', 'Hello from server!');
  });

  busEvents.onValue(event => eventHandler(event));

  next();
};

register.attributes = {
  name: 'bus-handler'
};

export default register;
