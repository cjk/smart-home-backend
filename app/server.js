import Path from 'path';
import {Server} from 'hapi';
import config from './config';
import Inert from 'inert';

/**
 * Start Hapi server
 */
const server = new Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'static')
      }
    }
  }
});

server.connection(config.server);

/**
 * Serve static requests
 */
server.register(Inert, (err) => {

  if (err)
    throw err;

  server.route({
    // method: 'GET',
    // path: '/',
    // handler: {
    // file: './index.html'
    // },

    method: 'GET',
    path: '/',
    handler: (req, reply) => { reply.file('index.html'); }

  });

  server.start((err) => {
    if (err)
      throw err;

    console.info('==> ✅  Server is listening');
    console.info('==> 🌎  Go to ' + server.info.uri.toLowerCase());
  });

});

export default server;
