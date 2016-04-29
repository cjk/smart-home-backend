import Inert from 'inert';
import BusHandler from './handler';
import Path from 'path';
import {Server} from 'hapi';

export default function(app) {
  const {conf, streams} = app;

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
  server.connection({port: 4001, labels: ['busHandler']});

  const api = server.select('api');
  const hdl = server.select('busHandler');

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

  /* Init (KNX-) bus-handler via HAPI Websockets plugin */
  hdl.register({register: BusHandler, options: {streams}}, (err) => {
    if (err)
      throw err;
  });

  server.start((err) => {
    if (err)
      throw err;

    console.info('==> ✅  Server started');
    console.info('==> 🌎  API is available on ' + server.connections[0].info.uri.toLowerCase());
    console.info('==> 🌎  HomeBus is available on ' + server.connections[1].info.uri.toLowerCase());
  });
}
