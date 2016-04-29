/* eslint no-console: "off" */

/* Listens to state-events from our fermenter-closet (via Websockets) and
   transforms those events into an fermenter-state-event stream. */
import immutable from 'immutable';
import Kefir from 'kefir';

function handleIncomingFermenterState(io) {
  const fermenter = io.of('/fermenter');

  const stream = Kefir.stream(emitter => {
    const emitFermenterState = (state) => {
      console.log('Emitting fermenter state we just received:',
                  JSON.stringify(immutable.fromJS(state).get('env')));
      return emitter.emit({fermenterState: state});
    };

    fermenter.on('connection', (socket) => {
      console.log('~~~ Fermenter-closet connected.');
      socket.on('fermenterState', emitFermenterState);
    });

    fermenter.on('disconnect', (socket) => {
      console.log('~~~ Fermenter-closet disconnected.');
      socket.removeListener('fermenterState', emitFermenterState);
      emitter.end();
    });

    /* For now do nothing on stream-deactivation */
    return () => {};
  });
  return stream;
}

export default handleIncomingFermenterState;
