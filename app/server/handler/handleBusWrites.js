import Address from '../../knx/address';
import K from 'kefir';
import {writeGroupSAddr, writeGroupAddr} from '../../knx/performBusAction';

function createRequestStream(socket) {
  return K.stream(emitter => {
    socket.on('writeToBus', (writeRequest) => {
      console.log('~~~ WriteToBus-Handler got request from web-client.');
      emitter.emit(new Address(writeRequest));
    });
  });
};

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
      }
    };

    const writeAddressStream = createRequestStream(socket);
    writeAddressStream.onValue(writeAddress)
                      .onError(errorHandler);

    io.on('disconnect', () => {
      writeAddressStream.OffValue(writeAddress)
                        .OffError(errorHandler);
    });
  });
}

export default handleBusWrites;
