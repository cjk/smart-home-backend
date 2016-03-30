/* Replies to 'initialstate'-Websocket requests by emitting the current
   bus-state downstream */

import K from 'kefir';

function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('initialstate', (req) => {
      console.log('~~~ Initialstate-Handler got request from web-client.');
      emitter.emit();
    });
  });
};

function errorHandler(error) {
  console.warn(error);
}

function handleInitialState(io, stream) {
  io.on('connection', (socket) => {

    function sendState(state) {
      console.log(`~~~ Emitting initial (smart-home-) state: ${JSON.stringify(state)}`);
      socket.emit('initialstate', state.toJS());
    };

    const stateRequestStream = createRequestStream(socket);
    const triggerStateRespone = stream.sampledBy(stateRequestStream);

    triggerStateRespone.onValue(sendState)
                       .onError(errorHandler);

    io.on('disconnect', () => {
      triggerStateRespone.OffValue(sendState)
                         .OffError(errorHandler);
    });
  });
}

export default handleInitialState;
