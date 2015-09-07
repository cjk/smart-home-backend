import knxd from 'eibd';
import Event from './event';

function groupSocketListen(opts, callback) {
  let conn = knxd.Connection();

  conn.socketRemote(opts, function() {
    conn.openGroupSocket(0, callback);
  });
}

export default function(opts) {

  return (emitter) => {

    groupSocketListen(opts, (parser) => {
      parser.on('write', function(src, dest, type, val) {
        // console.log('Write from '+src+' to '+dest+': '+val+' ['+type+']');
        emitter.emit(new Event({created: Date.now(), action: 'write', src: src, dest: dest, type: type, value: val}));
      });
      parser.on('response', function(src, dest, type, val) {
        // console.log('Response from '+src+' to '+dest+': '+val+' ['+type+']');
        emitter.emit(new Event({created: Date.now(), action: 'response', src: src, dest: dest, type: type, value: val}), 'foo');
      });
      parser.on('read', function(src, dest) {
        // console.log('Read from '+src+' to '+dest);
        emitter.emit(new Event({created: Date.now(), action: 'read', src: src, dest: dest}), 'bar');
      });
    });
  };

}
