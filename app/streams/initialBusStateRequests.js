import K from 'kefir';

export default function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('initialstate', (req) => {
      console.log('~~~ Initialstate-Handler got request from web-client.');
      emitter.emit();
    });
  });
}
