import Handlers from './handlers';
import {listener, handler} from '../knx';

let register = function(server, options, next) {

  let io = require('socket.io')(server.select('monitor').listener);

  const knxHandler = handler(io);
  listener(knxHandler);

  io.on('connection', function(socket) {

    console.log('New connection!');

    // socket.on('hello', Handlers.hello);
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
