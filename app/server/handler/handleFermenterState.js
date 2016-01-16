/* Replies to 'fermenterstate'-Websocket requests by emitting the current
   environmental / status received from the fermenter-closet downstream */

import K from 'kefir';

/* TODO: Check if we're leaking resources here - unsubscribe from streams,
   handle onDisconnect-socket, ...?! */
export default function handleFermenterState(socket, fermenterState) {
  const fermenterStateRequests = K.stream(emitter => {
    socket.on('fermenterstate', (req) => {
      emitter.emit(socket);
    });
  });

  const handleFermenterState = fermenterState.sampledBy(fermenterStateRequests, (state, socket) => [state, socket]);

  handleFermenterState
    .onValue((args) => {
      const [state, socket] = args;
      socket.emit('fermenterstate', state);
    })
    .onError(error => {
      console.warn(error);
    });
};
