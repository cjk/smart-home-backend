import config from '../config';
import knxd from 'eibd';
import Event from './event';

function groupSocketListen(opts, callback) {
  let conn = knxd.Connection();

  conn.socketRemote(opts, function() {
    conn.openGroupSocket(0, callback);
  });
}

export default function(handler, opts = {host: config.monitor.host, port: config.monitor.port}) {
  console.log('Setting up KNX-listener with handler: ', handler);

  groupSocketListen(opts, (parser) => {
    parser.on('write', function(src, dest, type, val) {
      // console.log('Write from '+src+' to '+dest+': '+val+' ['+type+']');
      handler(new Event({action: 'write', src: src, dest: dest, type: type, value: val}));
    });
    parser.on('response', function(src, dest, type, val) {
      // console.log('Response from '+src+' to '+dest+': '+val+' ['+type+']');
      handler(new Event({action: 'response', src: src, dest: dest, type: type, value: val}));
    });
    parser.on('read', function(src, dest) {
      // console.log('Read from '+src+' to '+dest);
      handler(new Event({action: 'read', src: src, dest: dest}));
    });
  });
}
