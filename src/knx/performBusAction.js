/* eslint no-console: "off" */

import knxd from 'eibd';
import R from 'ramda';
import config from '../config';
import {deriveAddrFormat} from './knx-lib';

function defaultCallback(err) {
  if (err) {
    console.error('[performBusAction] Error communicating with KNXd.');
    throw err;
  }
  console.log('[performBusAction] Success sending APDU to KNXd.');
}

const isWriteOnly = action => action === 'write';
const knxReadMsg = R.unary(knxd.createMessage);
const knxWriteMsg = R.partial(knxd.createMessage, ['write']);

function sendReqToBusFor(action, datatype, value, addrId, callback = defaultCallback) {
  const conn = knxd.Connection(); /* eslint new-cap: "off" */
  const addr = knxd.str2addr(addrId);
  const conf = config.knxd;

  conn.socketRemote(conf, () => {
    conn.openTGroup(addr, isWriteOnly(action), (err) => {
      if (err) {
        callback(err);
      } else {
        const msg = (action === 'read') ? /* as long as there is only read & write... */
                    knxReadMsg(action) :
                    knxWriteMsg(datatype, parseInt(value, 10));
        conn.sendAPDU(msg, callback);
      }
    });
  });
}

const readAddr = R.partial(sendReqToBusFor, ['read', null, null]);
const writeAddr = R.partial(sendReqToBusFor, ['write']);

/* TODO: use address-record for `address` everywhere instead of text-string */

export function readGroupAddr(addrId, callback = defaultCallback) {
  return readAddr(addrId, callback);
}

export function writeGroupAddr(address, callback = defaultCallback) {
  console.log(`[INFO] Writing to address ${address} in format <${deriveAddrFormat(address)}>`);
  return writeAddr(deriveAddrFormat(address), address.value, address.id, callback);
}
