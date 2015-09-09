export default function knxHandler() {
  return (socket) => (event) => {
    socket.emit('knx-event', event);
  };
}
