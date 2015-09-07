export default function knxHandler() {
  return (socket) => (event) => {
    socket.emit('KNX-event', event);
  };
}
