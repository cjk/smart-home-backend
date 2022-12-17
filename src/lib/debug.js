// @flow

import { format } from 'date-fns'
// import germanLocale from 'date-fns/locale/de';
import logFactory from 'debug'

const debug = logFactory('smt:debug')
const LOG_PREFIX = 'smt'

const tsFormat = 'yyyy-MM-ddTHH:mm:ss'

function addrMapToConsole(addrMap: any) {
  return addrMap.map((a) => debug(`[${a.room}>${a.name}]: ${a.value} @${format(a.updatedAt, 'HH:mm:s')}|`))
}

function getTimeFrom(ts: number) {
  return format(ts, 'HH:mm:s')
}

function getTimestamp() {
  return format(new Date(), tsFormat)
}

function logger(namespace: string) {
  const debug = logFactory(`${LOG_PREFIX}:${namespace}`)
  debug.log = (...args) => console.log(...args)

  const error = logFactory(`${LOG_PREFIX}:${namespace}`)
  // error.log = (...args) => console.error(...args);

  return {
    debug,
    error,
  }
}

export { addrMapToConsole, getTimeFrom, getTimestamp, logger }
