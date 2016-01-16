import config from './config';
import io from 'socket.io-client';
import Kefir from 'kefir';

const {host, port} = config.fermenter;

const socket = io.connect(`http://${host}:${port}`);

export default function createFermenterStreams() {

  const fermenterStateStream = Kefir.stream(emitter => {
    socket.on('tempHumidity', (state) => {
      console.log('Got Temp-Humidity-data:', state);
      emitter.emit({'fermenterState': state});
    });
  });

  /* Request fermenter environmental data */
  socket.emit('tempHumidity', {from: 'zircon'});

  return {
    fermenterState: fermenterStateStream
  };
};
