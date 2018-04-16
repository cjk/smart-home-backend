/* @flow */

import type { MinimalAddress } from '../../types';

/* Subscribes to / handle busWriteRequests from other clients */
import K from 'kefir';
import createAddress from '../../knx/address';
import { writeGroupAddr } from '../../knx/performBusAction';
import { logger } from '../../lib/debug';

const log = logger('backend:busServer');

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

function writeAddressToBus(addr: MinimalAddress) {
  log.debug(`About to perform address-write on request for address: ${JSON.stringify(addr)}`);
  if (addr.id) {
    // Sending a new value for an address in a specific format to the knx-bus may fail. Catch and print errors but don't let it crash
    try {
      writeGroupAddr(createAddress(addr));
    } catch (e) {
      log.error(
        `Failed to write to KNX-bus for address ${addr.id}. Check the address-type and format.`
      );
    }
  } else {
    log.error('Illegal KNX-address received for bus-writing - will not perform any bus action!');
  }
}

function errorHandler(err) {
  log.error(err);
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
