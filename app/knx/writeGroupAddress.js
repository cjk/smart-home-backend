import conf from '../config';
import knxd from 'eibd';

function sendWriteReqToBusFor(address, value, opts, callback) {
  const conn = knxd.Connection(),
        addr = knxd.str2addr(address);

  conn.socketRemote(opts, function() {
    conn.openTGroup(addr, true, (err) => {
      if (err) {
        callback(err);
      } else {
        let msg = knxd.createMessage('write', 'DPT3', parseInt(value));
        conn.sendAPDU(msg, callback);
      }
    });
  });
}

export default function writeGroupAddr(address, value, callback?) {
  sendWriteReqToBusFor(address, value, conf.knxd, (err) => {
    if (err) {
      console.error('[writeGroupAddress] Error communicating with EIBd!');
      throw err;
    }
    console.log('Write request to address <' + address + '> successfully sent.');
    if (callback)
      callback();

    return address;
  });
}
