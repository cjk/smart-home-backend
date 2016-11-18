function errorHandler(error) {
  console.warn(error);
}

function handleEvents(io, stream) {
  io.on('connection', (socket) => {
    function sendState(event) {
      console.log(`~~~ Emitting bus-event: ${JSON.stringify(event)}`);
      socket.emit('knx-event', event);
    }

    stream.onValue(sendState)
          .onError(errorHandler);

    io.on('disconnect', () => {
      stream.offValue(sendState)
            .offError(errorHandler);
    });
  });
}

export default handleEvents;
