// @flow

// Our store is currently a GunDB backed distributed-graph database
import type { ServerState, AddressMap, BusEvent } from '../types'

import Gun from 'gun'
import { logger } from './debug'
import R from 'ramda'

const port = 8765
const log = logger('store:gun')

const { createServer } = require('http')

const server = createServer((req, res) => Gun.serve(req, res))

const gun = Gun({ web: server })

server.listen(port)
log.debug(`Store available on port <${port}> at /gun`)

function createStore(state: ServerState) {
  log.debug('Initializing store...')

  const {
    streams: { busState$, busEvent$ },
  } = state

  const knxAddrState = gun.get('knxAddrList')

  // 1. Load initial knx-address state into the store:
  busState$.take(1).observe(
    function onValue(addrLst) {
      R.mapObjIndexed((addr, key) => knxAddrState.get(key).put(addr), addrLst)
    },

    function onError(err) {
      log.error(`Failed to obtain and store initial knx-address-state: ${err}`)
    },

    function onEnd() {
      log.debug('Initial state saved to store.')
    }
  )

  // 2. Listen to knx bus-events to keep the in-store address-state up-to-date:
  busEvent$.observe(
    function onValue(event: BusEvent) {
      busState$.take(1).onValue((nextState: AddressMap) => {
        const addrId = event.dest
        if (R.has(addrId, nextState)) {
          knxAddrState.get(addrId).put(nextState[addrId])
          log.debug(`Updated store with new value for address <${addrId}>: %O`, nextState[addrId])
        }
      })
    },

    function onError(err) {
      log.error(`Something when wrong while processing knx bus-events: ${err}`)
    },

    function onEnd() {
      log.debug('The store stopped listening to bus-events.')
    }
  )

  // 3. Listen to remote address-changes
  knxAddrState.map().on((data, addrId) => log.debug(`Someone changed address <${addrId}> to %O`, data))
}

export { createStore }
