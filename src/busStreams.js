// @flow

import type { AddressMap, BusEvent, KnxConf } from './types.js'

import * as R from 'ramda'
import Kefir from 'kefir'
import config from './config/index.js'
import knxListener from './knx/index.js'
import addressRefresher from './lib/auto-refresher.js'
import { logger } from './lib/debug.js'

const log = logger('backend:bus-events')

/* Takes the current bus-state and an event, applies the changes the event
   implies and returns the new bus-state */
const updateFromEvent = (currentState: AddressMap, event: BusEvent): AddressMap => {
  const addrId = event.dest

  if (!R.has(addrId, currentState)) {
    log.error(`No matching address found for key ${addrId} - ignoring!`)
    return currentState
  }

  const lastValue = R.path([addrId, 'value'], currentState)
  const { dest, value } = event
  const currentTs = Date.now()

  /* DEBUGGING */
  const message = `Updating address ${addrId} (${R.path([addrId, 'name'], currentState)})`

  if (value === lastValue) {
    log.debug(`${message}: no update necessary, keeping last value: <${lastValue}>`)
    return R.assocPath([dest, 'verifiedAt'], currentTs, currentState)
  }

  log.debug(`${message}: changed value from <${lastValue}> to <${value.toString()}>`)

  return R.assoc(
    dest,
    R.mergeRight(R.prop(dest, currentState), { value, verifiedAt: currentTs, updatedAt: currentTs }),
    currentState
  )
}

export default function createBusStreams() {
  const { readableAddrMap } = (config.knx: KnxConf)

  const initialstate = readableAddrMap
  /* DEBUGGING */
  // log.debug(JSON.stringify(initialstate))

  const mutatingEvents = ['write', 'response']

  /* Create BUS-state */
  /* 1. Create stream to capture *all* KNX-bus events */
  const busEvent$ = Kefir.stream((emitter) => knxListener(emitter))

  /* 2. Create another (sub-) stream only for events that carry a value, i.e.
     mutate our bus-state */
  const mutatingBusEvents = busEvent$.filter((e) => R.includes(e.action, mutatingEvents))

  /* 3. Create a modified (property-) stream derived from busState by applying an
     event-delta when events come in from the bus-events-stream.
     This reflects our bus-state changing over time.
   */
  const busState$ = mutatingBusEvents.scan(updateFromEvent, initialstate)

  /* Refresh address-values in state from time to time */
  if (config.modules.addressRefresher) {
    addressRefresher(busState$)
  }

  /* for DEBUGGING: Also locally log each KNX-bus event to the console */
  if (config.logging.logBusEvents) {
    busEvent$.log()
  }

  if (config.logging.logBusStateOnEvent) {
    busState$.log()
  }

  return {
    busEvent$,
    busState$,
  }
}
