// @flow

import type { AddressValue, BusEvent } from '../types.js'

const createEvent = (action: string, src: string, dest: string, type: string, value: AddressValue): BusEvent => ({
  created: Date.now(),
  action,
  src,
  dest,
  type,
  value,
})

export default createEvent
