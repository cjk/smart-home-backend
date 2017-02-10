/* @flow */
/* eslint no-console: "off" */

import type {Address} from '../types'
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

function sendReqToBusFor(action, datatype, value, address, callback = defaultCallback) {
  const conn = knxd.Connection(); /* eslint new-cap: "off" */
  const addrId = knxd.str2addr(address.id);
  const conf = config.knxd;

  conn.socketRemote(conf, () => {
    conn.openTGroup(addrId, isWriteOnly(action), (err) => {
      if (err) {
        return callback(err);
      }
      const msg = (action === 'read') ? /* as long as there is only read & write... */
                  knxReadMsg(action) :
                  knxWriteMsg(datatype, parseInt(value, 10));
      conn.sendAPDU(msg, callback);
      return callback(null);
    });
  });
}

const readAddr = R.partial(sendReqToBusFor, ['read', null, null]);
const writeAddr = R.partial(sendReqToBusFor, ['write']);

export function readGroupAddr(address:Address, callback:Function = defaultCallback) {
  return readAddr(address, callback);
}

export function writeGroupAddr(address:Address, callback:Function = defaultCallback) {
  const fmt = deriveAddrFormat(address);
  console.log(`[INFO] PerformBusAction: Writing to address ${address.id} in format <${fmt}>`);
  if (!fmt) {
    callback(new Error(`Unknown address-format for address <${address.id}>`));
  } else {
    writeAddr(fmt, address.value, address.id, callback);
  }
}
