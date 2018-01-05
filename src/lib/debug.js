// @flow
import { format } from 'date-fns';
// import germanLocale from 'date-fns/locale/de';
import logger from 'debug';

const debug = logger('smt:debug');

const tsFormat = 'YYYY-MM-DDTHH:mm:ss';

function addrMapToConsole(addrMap: any) {
  return addrMap.map(a =>
    debug(
      `[${a.room}>${a.name}]: ${a.value} @${format(a.updatedAt, 'HH:mm:s')}|`
    )
  );
}

function getTimeFrom(ts: number) {
  return format(ts, 'HH:mm:s');
}

function getTimestamp() {
  return format(new Date(), tsFormat);
}

export { addrMapToConsole, getTimeFrom, getTimestamp };
