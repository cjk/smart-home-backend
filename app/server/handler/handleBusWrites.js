import Address from '../../knx/address';
import {writeGroupSAddr, writeGroupAddr} from '../../knx/performBusAction';

export default function handleBusWrites(socket) {
  return (writeRequest) => {
    const addr = new Address(writeRequest);

    console.log('[handleBusWrites] Received write request for addr: ', addr);

    switch (addr.type) {

      case 'DPT3':
        writeGroupSAddr(addr.id, addr.value, (v) => console.log('done writing: ', v));
        break;

      case 'DPT5':
        writeGroupAddr(addr.addr, addr.value, (v) => console.log('done writing: ', v));
        break;
    }
  };
};
