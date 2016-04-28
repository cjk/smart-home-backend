import config from '../config';
import io from 'socket.io-client';
import Kefir from 'kefir';
import immutable from 'immutable';

const {host, port} = config.fermenter;

export default function createFermenterStreams() {
  if (!config.fermenter.isAvailable) {
    return {fermenterState: Kefir.constant({})};
  }

  const fermenterStateStream = Kefir.stream(emitter => {
    const emitFermenterState = (state) => {
      console.log('Emitting fermenter state we just received:', JSON.stringify(immutable.fromJS(state).get('env')));
      return emitter.emit({fermenterState: state});
    };

    const socket = io.connect(`http://${host}:${port}`);

    socket.on('connect_error', () => console.log(`ERROR connecting to fermenter-closet on <${host}:${port}>`))
          .on('connect_timeout', () => console.log(`TIMEOUT connecting to fermenter-closet <${host}:${port}>!`));

    socket.on('connect', () => {
      console.log('Connected to Fermenter-Closet - requesting fermenter-state...');
      socket.on('fermenterState', emitFermenterState);

      /* Request fermenter environmental data */
      return socket.emit('fermenterState', {from: 'smart-home-backend'});
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from Fermenter-Closet.');
      return emitter.end();
    });
  });

  return {
    fermenterState: fermenterStateStream
  };
}
