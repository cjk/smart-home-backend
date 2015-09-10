import config from '../config';
import knxd from 'eibd';
import R from 'ramda';

const defaultCallback = (err) => {
  if (err) {
    console.error('[performBusAction] Error communicating with KNXd.');
    throw err;
  }
  console.log('sendAPDU done.');
};

const isWriteOnly = (action) => action === 'write',
      knxReadMsg = R.unary(knxd.createMessage),
      knxWriteMsg = R.partial(knxd.createMessage, 'write');

const sendReqToBusFor = function(action, datatype, value, address) {
  const conn = knxd.Connection(),
        addr = knxd.str2addr(address),
        conf = config.knxd,
        callback = defaultCallback;

  conn.socketRemote(conf, function() {
    conn.openTGroup(addr, isWriteOnly(action), (err) => {
      if (err) {
        callback(err);
      } else {
        let msg = (action === 'read') ? /* as long as there is only read & write... */
                  knxReadMsg(action) :
                  knxWriteMsg(datatype, parseInt(value));
        conn.sendAPDU(msg, callback);
      }
    });
  });
};

const readAddr = R.partial(sendReqToBusFor, 'read', null, null);
const writeAddr = R.partial(sendReqToBusFor, 'write');

export function readGroupAddr(address, callback?) {
  return readAddr(address);
}

export function writeGroupSAddr(address, value, callback?) {
  return writeAddr('DPT3', value, address);
}

export function writeGroupAddr(address, value, callback?) {
  return writeAddr('DPT5', value, address);
}
