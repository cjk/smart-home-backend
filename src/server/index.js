/* @flow */

import type { ServerState } from '../types'
import busServer from './busServer'
import { logger } from '../lib/debug'

const log = logger('backend:server')

function publish(state: ServerState) {
  busServer(state)
  log.debug('==> Server started')
}

export default publish
