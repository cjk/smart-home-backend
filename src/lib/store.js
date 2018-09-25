// Our store is currently a GunDB backed distributed-graph database
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

function initStore(state) {
  log.debug('Initializing store...')

  const {
    streams: { busState$ },
  } = state

  const knxAddrState = gun.get('knxAddrList')

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
}

export { initStore }
