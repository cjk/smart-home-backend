/* eslint no-console: "off" */

import Kefir from 'kefir';
import immutable from 'immutable';

export default function createFermenterStateStream(fermenterIO) {
  const stream = Kefir.stream(emitter => {
    const emitFermenterState = (state) => {
      console.log('[Fermenter-State-Stream] Emitting fermenter state we just received:',
                  JSON.stringify(immutable.fromJS(state).get('rts')));
      return emitter.emit({fermenterState: state});
    };

    fermenterIO.on('connection', (socket) => {
      console.log('~~~ Fermenter-closet connected.');
      socket.on('fermenterState', emitFermenterState);
    });

    fermenterIO.on('disconnect', (socket) => {
      console.log('~~~ Fermenter-closet disconnected.');
      socket.removeListener('fermenterState', emitFermenterState);
      emitter.end();
    });

    /* PENDING: For now do nothing on stream-deactivation */
    return () => {};
  });
  return stream;
}
