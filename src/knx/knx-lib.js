// @flow

import type { Address, BusEvent, MinimalAddress } from '../types.js'
import { getISODay } from 'date-fns'
import { logger } from '../lib/debug.js'

const log = logger('backend:knx-lib')

/* Guess correct KNX-datatype / format from address-properties */
function deriveAddrFormat(addr: Address | MinimalAddress) {
  /* For reference, see https://www.domotiga.nl/projects/selfbus-knx-eib/wiki/Datatypes */
  switch (addr.func) {
    case 'light':
      /* DPT1 - 1 bit (0,1) */
      return 'DPT1'

    case 'shut':
      /* DPT1 - 1 bit (0,1) */
      return 'DPT1'

    case 'inhibit':
      /* DPT2 - 1 bit (0,1) + value (0,1) */
      return 'DPT2'

    case 'scene':
      /* DPT17 or DPT5 - 1 byte unsigned (0-255) */
      return 'DPT5'

    case 'dim':
      /* DPT 3 - (Position, Control, Value)  1 Bit, 4 Bit, 8 Bit [0,0]...[1,7] */
      /* PENDING: 1 byte is used for (physical) knx-switches?! */
      break

    case 'heat':
      /* DPT1 - 1 bit (0,1) */
      break

    case 'time':
      /* DPT10 - 3 bytes (weekday+hour/minutes/seconds) */
      return 'DPT10'

    default:
      return undefined
  }
  return undefined
}

// Helper if you want a save way to make sure an KNX event-value can be used to switch something (light, ...) on or off
// and you're *almost* certain the address-type is compatible (i.e. a number 0 or 1):
// Tries to convert an event-value of a knx-bus-event to a boolean value (like on|off or true|false) and print an error
// return false if this is not possible, since sum knx-address-types cannot be converted into a Boolean value
function addrValueToBoolean(event: BusEvent): boolean {
  if (typeof event.value === 'number' && event.type.match('DPT1|DPT2')) {
    return Boolean(event.value)
  }
  log.error('Cannot convert KNX-event of type %s with value <%s> to boolean!', event.type, event.value)
  return false
}

function createAddress(props: MinimalAddress): MinimalAddress {
  const addressDefaults = {
    name: 'none',
    room: 'none',
    story: 'none',
    type: 'switch',
    func: 'light',
    control: 'none',
  }

  return Object.assign({}, addressDefaults, props)
}

function dateTimeToDPT10Array(ts: Date): Array<number> {
  return [getISODay(ts), ts.getHours(), ts.getMinutes(), ts.getSeconds()]
}

export { addrValueToBoolean, createAddress, dateTimeToDPT10Array, deriveAddrFormat }
