export default function eventHandler() {
  return (socket) => (event) => {
    socket.emit('knx-event', event);
  };
}
