/* Replies to 'fermenterstate'-Websocket requests by emitting the current
   environmental / status received from the fermenter-closet downstream */

import R from 'ramda';

function errorHandler(error) {
  console.warn(error);
}

function handleFermenterState(io, stream) {
  io.on('connection', (socket) => {
    function sendState(state) {
      // console.log(`~~~ Emitting fermenterstate: ${JSON.stringify(state)}`);
      console.log(`~~~ Emitting fermenterstate as of ${state.fermenterState.env.createdAt}`);
      socket.emit('fermenterstate', state);
    }

    console.log(`~~~ Subscribing to stream <${stream}>`);
    stream.onValue(sendState)
          .onError(errorHandler);

    /* Make sure disconnect-listener is added only once to avoid Node event
       emitter memory leaks */
    R.once(() => {
      io.on('disconnect', () => {
        console.log(`~~~ Unsubscribing from stream <${stream}>`);
        stream.offValue(sendState)
              .offError(errorHandler);
      });
    });
  });
}

export default handleFermenterState;
