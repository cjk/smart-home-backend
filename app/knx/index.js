import knx from 'eibd';

function groupSocketListen(opts, callback) {
  let conn = knx.Connection();

  conn.socketRemote(opts, function() {
    conn.openGroupSocket(0, callback);
  });
}

export default function(opts = {host: 'zircon', port: 6720}) {
  groupSocketListen(opts, (parser) => {
    parser.on('write', function(src, dest, type, val) {
      console.log('Write from '+src+' to '+dest+': '+val+' ['+type+']');
    });
    parser.on('response', function(src, dest, type, val) {
      console.log('Response from '+src+' to '+dest+': '+val+' ['+type+']');
    });
    parser.on('read', function(src, dest) {
      console.log('Read from '+src+' to '+dest);
    });
  });
}
