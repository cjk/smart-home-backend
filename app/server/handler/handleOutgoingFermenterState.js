/* eslint no-console: "off" */

/* Replies to 'fermenterstate'-Websocket requests by emitting the current
   environmental / status received from the fermenter-closet downstream */
function errorHandler(error) {
  console.warn(`ERROR occured: ${error}`);
}

function handleOutgoingFermenterState(io, stream) {
  io.on('connection', (socket) => {
    function sendState(state) {
      console.log(`[Fermenter-Out-Stream] Emitting fermenterstate (via WS) as of ${state.fermenterState.env.createdAt}`);
      /* TODO: It seems we're currently emitting fermenter state to *all*
         connected clients - which included the fermenter-closet itself?!! And
         each time the smart-home-app is reloaded in the browser, a new client
         is subscribing and we're emitting to an additional client! */
      return socket.emit('fermenter-state', state);
    }

    console.log('~~~ Some client subscribed to our fermenter-stream');
    stream.onValue(sendState)
          .onError(errorHandler);

    io.on('disconnect', () => {
      console.log('~~~ Some client unsubscribed from our fermenter-stream');
      stream.offValue(sendState)
            .offError(errorHandler);
    });
    io.on('error', () => {
      console.log('[[ERROR]]');
    });
    io.on('newListener', () => {
      console.log('[[NEW_LISTENER]]');
    });
    io.on('removeListener', () => {
      console.log('[[REMOVE_LISTENER]]');
    });
  });
}

export default handleOutgoingFermenterState;
