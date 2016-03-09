import config from './config';
import io from 'socket.io-client';
import Kefir from 'kefir';
import moment from 'moment';
import immutable, {Map} from 'immutable';

const {host, port} = config.fermenter;

const socket = io.connect(`http://${host}:${port}`);

socket
  .on('connect', () => console.log(`Connected to fermenter-closet.`))
  .on('connect_error', () => console.log(`ERROR connecting to fermenter-closet!`))
  .on('connect_timeout', () => console.log(`TIMEOUT connecting to fermenter-closet!`));

export default function createFermenterStreams() {

  const fermenterStateStream = Kefir.stream(emitter => {
    socket.on('tempHumidity', (state) => {
      console.log('Got Fermenter-State:', JSON.stringify(immutable.fromJS(state).updateIn(['env', 'createdAt'], v => moment(v).format())));
      emitter.emit({'fermenterState': state});
    });
  });

  /* Request fermenter environmental data */
  socket.emit('tempHumidity', {from: 'smart-home-backend'});

  return {
    fermenterState: fermenterStateStream
  };
};
