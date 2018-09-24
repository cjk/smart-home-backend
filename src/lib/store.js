// Our store is currently a GunDB backed distributed-graph database
import Gun from 'gun'
import { logger } from './debug'

const port = 8765
const log = logger('store:gun')

const { createServer } = require('http')

const server = createServer((req, res) => Gun.serve(req, res))

const gun = Gun({ web: server })

server.listen(port)
log.debug(`Store available on port <${port}> at /gun`)

function init_store(state) {
  log.debug('Initialized store!')
}

export { init_store }
