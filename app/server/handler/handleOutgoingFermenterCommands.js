function errorHandler(error) {
  console.warn(error);
}

export default function handleOutgoingFermenterCommands(io, fermenterCommandStream) {
  const fermenterIO = io.of('/fermenter');

  fermenterIO.on('connection', (socket) => {
    function commandToFermenter(cmd) {
      console.log(`~~~ Dispatching fermenter-command to fermenter-closet: ${JSON.stringify(cmd)}`);
      socket.emit('fermenterCmd', cmd);
    }

    fermenterCommandStream.onValue(commandToFermenter)
                          .onError(errorHandler);

    fermenterIO.on('disconnect', () => {
      fermenterCommandStream.offValue(commandToFermenter)
                            .offError(errorHandler);
    });
  });
}
