/* Replies to 'fermenterstate'-Websocket requests by emitting the current
   environmental / status received from the fermenter-closet downstream */

import K from 'kefir';

function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('fermenterstate', (req) => {
      console.log('~~~ Fermenter-Handler got request from web-client.');
      emitter.emit(socket);
    });
  });
};

function handleFermenterState(io, stream) {
  io.on('connection', (socket) => {

    function sendState(state) {
      console.log(`~~~ Emitting fermenterstate: ${JSON.stringify(state)}`);
      socket.emit('fermenterstate', state);
    };

    //const stateRequestStream = createRequestStream(socket);
    //stateRequestStream.onValue(sendState);

    stream.onValue(sendState)
                        .onError(error => {
                          console.warn(error);
                        });

    io.on('disconnect', () => {
      stream.OffValue(sendState);
    });
  });
}

export default handleFermenterState;
