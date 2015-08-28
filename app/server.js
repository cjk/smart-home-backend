import config from './config';
import Inert from 'inert';
import Monitor from './monitor';
import Path from 'path';
import {Server} from 'hapi';

/**
 * Start Hapi server
 */
const server = new Server({
  connections: {
    routes: {
      cors: {credentials: true},
      files: {
        relativeTo: Path.join(__dirname, 'static')
      }
    }
  }
});

server.connection({port: config.server.port, labels: ['api']});
server.connection({port: 4001, labels: ['monitor']});

const api = server.select('api');
const mon = server.select('monitor');

/**
 * Serve static requests
 */
api.register(Inert, (err) => {
  if (err)
    throw err;

  api.route({
    method: 'GET',
    path: '/',
    handler: (req, reply) => { reply.file('index.html'); }
  });

});

/* Init KNX bus monitor via Websockets plugin */
mon.register(Monitor, function(err) {
  if (err)
    throw err;

});

export default function() {
  server.start((err) => {
    if (err)
      throw err;

    console.info('==> ✅  Server is listening');
    console.info('==> 🌎  Go to ' + server.info.uri.toLowerCase());
  });
}
