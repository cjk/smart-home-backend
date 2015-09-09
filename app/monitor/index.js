import IO from 'socket.io';
import KnxHandler from './knx-handler';

let register = function(server, options, next) {

  const io = IO(server.select('monitor').listener),
    knxHandler = KnxHandler()(io),
    knxEvents = options.busEmitter,
    busState = options.busState;

  io.on('connection', function(socket) {

    console.log('Got a WS-connection');

    io.on('disconnect', function() {
      knxEvents.offValue(() => knxHandler());
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

  knxEvents.onValue(event => knxHandler(event));

  next();
};

register.attributes = {
  name: 'knx-monitor'
};

export default register;
