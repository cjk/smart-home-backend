/* Replies to 'initialstate'-Websocket requests by emitting the current
   bus-state downstream */
import createRequestStream from '../../streams/initialBusStateRequests';

function errorHandler(error) {
  console.warn(error);
}

function handleInitialState(io, stream) {
  io.on('connection', (socket) => {
    function sendState(state) {
      console.log(`~~~ Emitting initial / full (smart-home-) state: ${JSON.stringify(state)}`);
      socket.emit('initialstate', state.toJS());
    }

    const stateRequestStream = createRequestStream(socket);
    const triggerStateRespone = stream.sampledBy(stateRequestStream);

    triggerStateRespone.onValue(sendState)
                       .onError(errorHandler);

    io.on('disconnect', () => {
      triggerStateRespone.offValue(sendState)
                         .offError(errorHandler);
    });
  });
}

export default handleInitialState;
