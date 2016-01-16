import Address from '../../knx/address';
import K from 'kefir';
import {writeGroupSAddr, writeGroupAddr} from '../../knx/performBusAction';

export default function handleBusWrites(socket) {

  const writeRequests = K.stream(emitter => {
    socket.on('writeToBus', (writeRequest) => {
      emitter.emit(new Address(writeRequest));
    });
  });

  writeRequests.onValue((addr) => {
    console.log('[handleBusWrites] Received write request for addr: ', addr);

    switch (addr.type) {
      case 'DPT3':
        writeGroupSAddr(addr.id, addr.value, (v) => console.log('done writing to s-addr: ', v));
        break;

      case 'DPT5':
        writeGroupAddr(addr.addr, addr.value, (v) => console.log('done writing to addr: ', v));
        break;
    }
  });
};
