/* @flow */

import logger from 'debug';
import type { Address } from '../types';
import knxd from 'eibd';
import R from 'ramda';
import config from '../config';
import { deriveAddrFormat } from './knx-lib';

const debug = logger('smt:bus'),
  error = logger('error');

function defaultCallback(err) {
  if (err) {
    error('Error communicating with KNXd.');
    throw err;
  }
  debug('Success sending APDU to KNXd.');
}

const isWriteOnly = action => action === 'write';
const knxReadMsg = R.unary(knxd.createMessage);
const knxWriteMsg = R.partial(knxd.createMessage, ['write']);

function sendReqToBusFor(
  action,
  datatype,
  address,
  callback = defaultCallback
) {
  const conn = knxd.Connection(); /* eslint new-cap: "off" */
  const addrId = knxd.str2addr(address.id);
  const conf = config.knxd;

  conn.socketRemote(conf, () => {
    conn.openTGroup(addrId, isWriteOnly(action), err => {
      if (err) {
        return callback(err);
      }
      const msg =
        action === 'read' /* as long as there is only read & write... */
          ? knxReadMsg(action)
          : knxWriteMsg(datatype, address.value);
      return conn.sendAPDU(msg, callback(null));
    });
  });
}

/* Do not really try to read/write to KNX-bus, just simulate it - good for testing / debugging */
function fakeReqToBusFor(
  action,
  datatype,
  address,
  callback = defaultCallback
) {
  debug(
    `*Fakeing* <${action}> bus-request to address ${address.id} with value [${address.value}] and datatype <${datatype}>`
  );
  setTimeout(callback, 250, null);
}

const readAddr = R.partial(sendReqToBusFor, ['read', null]);
const writeAddr = R.partial(
  config.commands.simulate ? fakeReqToBusFor : sendReqToBusFor,
  ['write']
);

export function readGroupAddr(
  address: Address,
  callback: Function = defaultCallback
) {
  return readAddr(address, callback);
}

export function writeGroupAddr(
  address: Address,
  callback: Function = defaultCallback
) {
  const fmt = deriveAddrFormat(address);
  debug(
    `PerformBusAction: Writing to address ${address.id} in format <${fmt}>`
  );
  if (!fmt) {
    return callback(
      new Error(`Unknown address-format for address <${address.id}>`)
    );
  }
  return writeAddr(fmt, address, callback);
}
