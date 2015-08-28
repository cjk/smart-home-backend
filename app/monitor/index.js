import * as Handlers from './handlers';
import knx from '../knx';

const knxEventStream = knx();

let register = function(server, options, next) {

  var io = require('socket.io')(server.select('monitor').listener);

  io.on('connection', function(socket) {

    console.log('New connection!');

    socket.on('hello', Handlers.hello);
    // socket.on('newMessage', Handlers.newMessage);
    // socket.on('goodbye', Handlers.goodbye);

    socket.emit('news', 'Hello from server!');
  });

  next();
};

register.attributes = {
  name: 'knx-monitor'
};

export default register;
