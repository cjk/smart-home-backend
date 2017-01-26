/* @flow */
/* eslint no-console: "off" */

/* Subscribes to / handle busWriteRequests from other clients */
import K from 'kefir';
import Address from '../../knx/address';
import {writeGroupAddr} from '../../knx/performBusAction';

const createBusWriteEventSubStream = (client) =>
  K.stream((emitter) => {
    const onBusWrite = (addr) => {
      emitter.emit(addr);
    };
    client.event.subscribe('knx/writeGroupAddr', onBusWrite);
    return () => {
      client.event.unsubscribe('knx/writeGroupAddr', onBusWrite);
    };
  });

function writeAddressToBus(addr) {
  console.log(`[handleBusWrites] About to perform address-write on request for address: ${JSON.stringify(addr)}`);
  if (addr.id) {
    writeGroupAddr(new Address(addr));
  } else {
    console.error('[handleBusWrites] ERROR - Illegal KNX-address received for bus-writing - will not perform any bus action!');
  }
};

function errorHandler(error) {
  console.warn(error);
}

function handleBusWrites(client: any) {
  const busWriteHandler = createBusWriteEventSubStream(client);

  return busWriteHandler.observe({
    value(addr) {
      writeAddressToBus(addr)
    },
    error(e) {
      errorHandler(e);
    },
  })
}

export default handleBusWrites;
