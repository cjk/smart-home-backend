/* eslint no-console: "off" */

import Address from '../../knx/address';
import K from 'kefir';
import {writeGroupAddr} from '../../knx/performBusAction';

/* TODO: Move to ../../streams directory */
function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('writeToBus', (writeRequest) => {
      //       console.log('~~~ WriteToBus-Handler got request from web-client.');
      emitter.emit(new Address(writeRequest));
    });
  });
}

function errorHandler(error) {
  console.warn(error);
}

function handleBusWrites(io) {
  io.on('connection', (socket) => {
    function writeAddress(addr) {
      console.log(`[DEBUG] Performing address-write on request for address: ${JSON.stringify(addr)}`);
      writeGroupAddr(addr);
    }

    const writeAddressStream = createRequestStream(socket);

    function disconnectHndlr() {
      writeAddressStream.offValue(writeAddress)
                        .offError(errorHandler);
    }

    writeAddressStream.onValue(writeAddress)
                      .onError(errorHandler);

    io.sockets.removeListener('disconnect', disconnectHndlr);
    io.on('disconnect', disconnectHndlr);
  });
}

export default handleBusWrites;
