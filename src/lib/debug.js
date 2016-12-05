import {format} from 'date-fns';

function addrMapToConsole(addrMap) {
  return addrMap.map(a => `[${a.room}>${a.name}]: ${a.value} @${format(a.updatedAt, 'HH:mm:s')}|`);
}

export default addrMapToConsole;
