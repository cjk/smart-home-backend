/* eslint no-console: "off" */

import Address from '../../knx/address';
import K from 'kefir';
import {writeGroupSAddr, writeGroupAddr} from '../../knx/performBusAction';

/* TODO: Move to ../../streams directory */
function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('writeToBus', (writeRequest) => {
      console.log('~~~ WriteToBus-Handler got request from web-client.');
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
      console.log(`~~~ Performing address-write on request for address: ${JSON.stringify(addr)}`);

      switch (addr.type) {
        case 'DPT3':
          writeGroupSAddr(addr.id, addr.value, (v) => console.log('done writing to s-addr: ', v));
          break;

        case 'DPT5':
          writeGroupAddr(addr.addr, addr.value, (v) => console.log('done writing to addr: ', v));
          break;

        default:
          console.log(`WARNING: Unknown knx-address type detected: <${addr.type}>`);
      }
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
