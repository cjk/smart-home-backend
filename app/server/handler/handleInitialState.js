export default function handleInitialState(socket, busState) {
  return (request) => {
    /* discard (unneeded) data from initialstate-message for now */
    busState.onValue((currentState) => socket.emit('initialstate', currentState));
  };
};
