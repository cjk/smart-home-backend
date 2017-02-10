import {format} from 'date-fns';

function addrMapToConsole(addrMap:any) {
  return addrMap.map(a => `[${a.room}>${a.name}]: ${a.value} @${format(a.updatedAt, 'HH:mm:s')}|`);
}

function getTimeFrom(ts:number) {
  return format(ts, 'HH:mm:s');
}

function getTimestamp() {
  return new Date().toISOString().slice(0, 19);
}

export {
  addrMapToConsole,
  getTimeFrom,
  getTimestamp,
};
