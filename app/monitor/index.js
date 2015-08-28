import Handlers from './handlers';
import {knxListender, handler} from '../knx';

let register = function(server, options, next) {

  const io = require('socket.io')(server.select('monitor').listener),
        knxHandler = handler(io);

  knxListender(knxHandler);

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
