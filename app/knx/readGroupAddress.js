import conf from '../config';
import knxd from 'eibd';

function sendReadReqToBusFor(address, opts, callback) {
  const conn = knxd.Connection(),
        addr = knxd.str2addr(address);

  conn.socketRemote(opts, function() {
    conn.openTGroup(addr, false, (err) => {
      if (err) {
        callback(err);
      } else {
        let msg = knxd.createMessage('read');
        conn.sendAPDU(msg, callback);
      }
    });
  });
}

export default function readGroupAddr(address, callback?) {
  sendReadReqToBusFor(address, conf.knxd, (err) => {
    if (err) {
      console.error('[readGroupAddress] Error communicating with EIBd!');
      throw err;
    }
    console.log('Read request to address <' + address + '> successfully sent.');
    if (callback)
      callback();

    return address;
  });
}
