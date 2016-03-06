import config from './config';
import io from 'socket.io-client';
import Kefir from 'kefir';
import moment from 'moment';
import {Map} from 'immutable';

const {host, port} = config.fermenter;

const socket = io.connect(`http://${host}:${port}`);

export default function createFermenterStreams() {

  const fermenterStateStream = Kefir.stream(emitter => {
    socket.on('tempHumidity', (state) => {
      console.log('Got Fermenter-State:', JSON.stringify(new Map(state).update('createdAt', v => moment(v).format())));
      emitter.emit({'fermenterState': state});
    });
  });

  /* Request fermenter environmental data */
  socket.emit('tempHumidity', {from: 'smart-home-backend'});

  return {
    fermenterState: fermenterStateStream
  };
};
