/* eslint no-console: "off" */

import Kefir from 'kefir';

export default function createFermenterCmdStream(io) {
  const stream = Kefir.stream(emitter => {
    const emitFermenterCmd = cmd => {
      console.log(
        `[Fermenter-Cmd-Stream] Emitting fermenter command we just received: <${cmd}>`
      );
      return emitter.emit({ fermenterCmd: cmd });
    };

    io.on('connection', socket => {
      socket.on('fermenterCommand', emitFermenterCmd);
    });

    io.on('disconnect', socket => {
      socket.removeListener('fermenterCommand', emitFermenterCmd);
      emitter.end();
    });

    /* PENDING: For now do nothing on stream-deactivation */
    return () => {};
  });
  return stream;
}
