/* eslint no-console: "off" */

/* Listens to fermenter-commands from clients (via Websockets) and transforms
   those commands into a command-stream for further acting on. */
import createFermenterCmdStream from '../../streams/fermenterCommands';

function handleIncomingFermenterCommands(io) {
  return createFermenterCmdStream(io);
}

export default handleIncomingFermenterCommands;
