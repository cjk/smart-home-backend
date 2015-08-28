/* Receives KNX-events from a listener and transforms / evaluates them and
   finally send the result to clients via a socket */
export default function(socket) {

  return (event) => {
    console.log('Emtting event: ', event);
    socket.emit('KNX-event', event);
  };
}
