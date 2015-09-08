import IO from 'socket.io';
import KnxHandler from './knx-handler';

let register = function(server, options, next) {

  const io = IO(server.select('monitor').listener),
        knxHandler = KnxHandler()(io),
        knxEvents = options.busEmitter;

  io.on('connection', function(socket) {

    console.log('Got a WS-connection');

    // socket.on('hello', Handlers.hello);
    // socket.on('newMessage', Handlers.newMessage);
    // socket.on('goodbye', Handlers.goodbye);

    // socket.emit('news', 'Hello from server!');
  });

  knxEvents.onValue(event => knxHandler(event));

  io.on('disconnect', function() {
    knxEvents.offValue(() => knxHandler());
  });

  next();
};

register.attributes = {
  name: 'knx-monitor'
};

export default register;
