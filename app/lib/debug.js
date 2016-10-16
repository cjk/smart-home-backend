import moment from 'moment';

function addrMapToConsole(addrMap) {
  return addrMap.map(a => `[${a.room}>${a.name}]: ${a.value} @${moment(a.updatedAt).format('HH:mm:s')}|`);
}

export default addrMapToConsole;
