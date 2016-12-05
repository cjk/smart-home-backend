/* eslint no-console: "off" */

/* Replies to 'fermenterstate'-Websocket requests by emitting the current
   environmental / status received from the fermenter-closet downstream */

import R from 'ramda';
import {format} from 'date-fns';

function errorHndlr(error) {
  console.warn(`ERROR occured: ${error}`);
}

function infoHdlr(src, message) {
  console.log(`[${src}]: ${message}`);
}

const newListenerHndlr = R.partial(infoHdlr, ['NEW_LISTENER']);
const removeListenerHndlr = R.partial(infoHdlr, ['REMOVE_LISTENER']);

function handleOutgoingFermenterState(io, stream) {
  io.on('connection', (socket) => {
    function sendState(state) {
      console.log(`[Fermenter-Out-Stream] Emitting fermenterstate (via WS) as of ${format(state.fermenterState.env.createdAt)}`);
      /* TODO: It seems we're currently emitting fermenter state to *all*
         connected clients - which included the fermenter-closet itself?!! And
         each time the smart-home-app is reloaded in the browser, a new client
         is subscribing and we're emitting to an additional client! */
      return socket.emit('fermenter-state', state);
    }

    function disconnectHndlr() {
      console.log('~~~ Some client unsubscribed from our fermenter-stream');
      stream.offValue(sendState)
            .offError(errorHndlr);
    }

    console.log('~~~ Some client subscribed to our fermenter-stream');
    stream.onValue(sendState)
          .onError(errorHndlr);

    io.sockets.removeListener('disconnect', disconnectHndlr);
    io.on('disconnect', disconnectHndlr);
  });
  io.on('error', errorHndlr);
  io.on('newListener', newListenerHndlr);
  io.on('removeListener', removeListenerHndlr);
}

export default handleOutgoingFermenterState;
