import config from '../config';
import knxd from 'eibd';
import R from 'ramda';

function defaultCallback(err) {
  if (err) {
    console.error('[performBusAction] Error communicating with KNXd.');
    throw err;
  }
  console.log('sendAPDU done.');
};

const isWriteOnly = (action) => action === 'write',
      knxReadMsg = R.unary(knxd.createMessage),
      knxWriteMsg = R.partial(knxd.createMessage, ['write']);

const sendReqToBusFor = function(action, datatype, value, address, callback = defaultCallback) {
  const conn = knxd.Connection(),
        addr = knxd.str2addr(address),
        conf = config.knxd;

  conn.socketRemote(conf, function() {
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
};

const readAddr = R.partial(sendReqToBusFor, ['read', null, null]);
const writeAddr = R.partial(sendReqToBusFor, ['write']);

/* TODO: use address-record for `address` everywhere instead of text-string */

export function readGroupAddr(address, callback = defaultCallback) {
  return readAddr(address, callback);
}

export function writeGroupSAddr(address, value, callback = defaultCallback) {
  return writeAddr('DPT3', value, address, callback);
}

export function writeGroupAddr(address, value, callback = defaultCallback) {
  return writeAddr('DPT5', value, address, callback);
}
