/* eslint no-console: "off" */

function errorHandler(error) {
  console.warn(error);
}

export default function handleOutgoingFermenterCommands(io, fermenterCommandStream) {
  const fermenterIO = io.of('/fermenter');

  fermenterIO.on('connection', (socket) => {
    function commandToFermenter(cmd) {
      console.log(`~~~ Dispatching fermenter-command to fermenter-closet: <${JSON.stringify(cmd)}>`);
      socket.emit('fermenterCmd', cmd);
    }

    function disconnectHndlr() {
      console.log('~~~ Some client unsubscribed from our fermenter-command-stream');
      fermenterCommandStream.offValue(commandToFermenter)
                            .offError(errorHandler);
    }

    fermenterCommandStream.onValue(commandToFermenter)
                          .onError(errorHandler);

    fermenterIO.removeListener('disconnect', disconnectHndlr);
    fermenterIO.on('disconnect', disconnectHndlr);
  });
}
