/* Replies to 'initialstate'-Websocket requests by emitting the current
   bus-state downstream */

import K from 'kefir';

/* TODO: Check if we're leaking resources here - unsubscribe from streams,
   handle onDisconnect-socket, ...?! */
export default function handleInitialState(socket, busState) {
  const initialStateRequests = K.stream(emitter => {
    socket.on('initialstate', (req) => {
      emitter.emit(socket);
    });
  });

  const handleInitialState = busState.sampledBy(initialStateRequests, (state, socket) => [state, socket]);

  handleInitialState.onValue((args) => {
    const [state, socket] = args;
    socket.emit('initialstate', state);
  });
};
