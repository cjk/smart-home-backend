/* @flow */

/* Subscribes to / handle busWriteRequests from other clients */
import logger from 'debug';
import K from 'kefir';
import Address from '../../knx/address';
import { writeGroupAddr } from '../../knx/performBusAction';

const debug = logger('smt:backend'),
  error = logger('error');

const createBusWriteEventSubStream = client =>
  K.stream(emitter => {
    const onBusWrite = addr => {
      emitter.emit(addr);
    };
    client.event.subscribe('knx/writeGroupAddr', onBusWrite);
    return () => {
      client.event.unsubscribe('knx/writeGroupAddr', onBusWrite);
    };
  });

function writeAddressToBus(addr) {
  debug(
    `About to perform address-write on request for address: ${JSON.stringify(
      addr
    )}`
  );
  if (addr.id) {
    // Sending a new value for an address in a specific format to the knx-bus may fail. Catch and print errors but don't let it crash
    try {
      writeGroupAddr(new Address(addr));
    } catch (e) {
      error(
        `Failed to write to KNX-bus for address ${addr.id}. Check the address-type and format.`
      );
    }
  } else {
    error(
      '[handleBusWrites] ERROR - Illegal KNX-address received for bus-writing - will not perform any bus action!'
    );
  }
}

function errorHandler(err) {
  error(err);
}

function handleBusWrites(conn: Function) {
  const busWriteHandler = createBusWriteEventSubStream(conn);

  return busWriteHandler.observe({
    value(addr) {
      writeAddressToBus(addr);
    },
    error(e) {
      errorHandler(e);
    },
  });
}

export default handleBusWrites;
