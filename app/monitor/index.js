/* TODO: Make use of Handlers */
// import Handlers from './handlers';
let register = function(server, options, next) {

  const io = require('socket.io')(server.select('monitor').listener),
        knxEvents = options.knxEmitter;

  const sendKNXEvent = (event) => {
    io.emit('KNX-event', event);
  };

  io.on('connection', function(socket) {

    console.log('Got a WS-connection');

    // socket.on('hello', Handlers.hello);
    // socket.on('newMessage', Handlers.newMessage);
    // socket.on('goodbye', Handlers.goodbye);

    // socket.emit('news', 'Hello from server!');

  });
  knxEvents.onValue(event => sendKNXEvent(event));

  io.on('disconnect', function() {
    knxEvents.offValue(() => sendKNXEvent());
  });

  next();
};

register.attributes = {
  name: 'knx-monitor'
};

export default register;
