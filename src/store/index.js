// @flow

// Our store is currently a GunDB backed distributed-graph database
// Here we establish handler to sync backend-state with our remote-peers and listen to updates from remote peers.
import type { Address, AddressMap, BusEvent, ServerState } from '../types'

import Gun from 'gun'
import K from 'kefir'
import R from 'ramda'
import { createAddress, isCompleteAddress } from '../knx/address'
import { writeGroupAddr } from '../knx/performBusAction'
import { logger } from '../lib/debug'

const port = 8765
const log = logger('store:gun')

const { createServer } = require('http')

const server = createServer((req, res) => Gun.serve(req, res))

const gun = Gun({ web: server })

server.listen(port)
log.debug(`Store available on port <${port}> at /gun`)

const fromAddrUpdateStream = addrNodeLst =>
  K.stream(emitter => {
    const onAddrChange = (addr, id) => {
      emitter.emit({ ...addr, id })
    }
    addrNodeLst.map().on(onAddrChange, { change: true })
    return () => {
      addrNodeLst.map().off()
    }
  })

// This first saves the current knx-bus-state into our peer-db to make it available to other peers.
// Then it subscribes to our knx-bus-event stream and syncs those events to the peer-db when they happen.
const handleKnxLivestate = ({ busState$, busEvent$ }) => {
  const peerKnxAddrLst = gun.get('knxAddrList')

  // 1. Load initial knx-address state into the store:
  busState$.take(1).observe(
    function onValue(addrLst) {
      R.mapObjIndexed((addr, key) => peerKnxAddrLst.get(key).put(addr), addrLst)
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
          peerKnxAddrLst.get(addrId).put(nextState[addrId])
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

  // 3. Listen to remote address-changes and merge them into our local livestate
  K.combine([fromAddrUpdateStream(peerKnxAddrLst)], [busState$], (addr: Address, addrList: AddressMap) => ({
    addr,
    addrList,
  }))
    .filter(({ addr }) => isCompleteAddress(addr))
    .observe(function onValue({ addr, addrList }) {
      const oldValue = addrList[addr.id].value
      // log.debug(`Someone changed address <${addr.id}> to %O`, addr)
      if (oldValue !== addr.value) {
        try {
          writeGroupAddr(createAddress(R.dissoc('_', addr)))
        } catch (e) {
          log.error(`Failed to write to KNX-bus for address ${addr.id}. Check the address-type and format.`)
        }
      }
    })
}

const syncScenesToCloud = scenes => {
  const peerSceneLst = gun.get('scenes')

  R.map(scene => {
    peerSceneLst.get(scene.id).put(scene)
  }, scenes)

  // // DEBUGGING:
  // log.debug('Currently synced scenes:')
  // peerSceneLst.map().once(e => log.debug(JSON.stringify(e)))
}

function createStore(state: ServerState) {
  log.debug('Initializing store...')

  handleKnxLivestate(state.streams)

  syncScenesToCloud(state.scenes)

  return {
    peer: gun,
    crontabNode() {
      return gun.get('crontab')
    },
    shutdown() {
      // abort + cleanup logic goes here:
      gun.get('knxAddrList').off()
    },
  }
}

export { createStore }
