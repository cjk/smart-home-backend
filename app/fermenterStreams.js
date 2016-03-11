import config from './config';
import io from 'socket.io-client';
import Kefir from 'kefir';
import moment from 'moment';
import immutable from 'immutable';

const {host, port} = config.fermenter;

export default function createFermenterStreams() {

  const fermenterStateStream = Kefir.stream(emitter => {
    const emitFermenterState = (state) => {
      console.log('Got Fermenter-State:', JSON.stringify(immutable.fromJS(state).updateIn(['env', 'createdAt'], v => moment(v).format())));
      emitter.emit({'fermenterState': state});
    };

    const socket = io.connect(`http://${host}:${port}`);

    socket.on('connect_error', () => console.log(`ERROR connecting to fermenter-closet on <${host}:${port}>`))
          .on('connect_timeout', () => console.log(`TIMEOUT connecting to fermenter-closet <${host}:${port}>!`));

    socket.on('connect', () => {
      console.log('Connected to Fermenter-Closet - requesting fermenter-state...');
      socket.on('tempHumidity', emitFermenterState);

      /* Request fermenter environmental data */
      socket.emit('tempHumidity', {from: 'smart-home-backend'});
    });
  });

  return {
    fermenterState: fermenterStateStream
  };
}
