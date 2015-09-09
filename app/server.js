import Inert from 'inert';
import Monitor from './monitor';
import Path from 'path';
import {Server} from 'hapi';

export default function(app) {
  const {conf, busEmitter, busState} = app;

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

  server.connection({port: conf.port, labels: ['api']});
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
  mon.register({register: Monitor, options: {busEmitter: busEmitter, busState: busState}}, function(err) {
    if (err)
      throw err;

  });

  server.start((err) => {
    if (err)
      throw err;

    console.info('==> ✅  Server is listening');
    console.info('==> 🌎  Go to ' + server.info.uri.toLowerCase());
  });
}
