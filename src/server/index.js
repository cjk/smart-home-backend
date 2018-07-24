/* @flow */

import type { ServerState } from '../types'
import busServer from './busServer'
import { logger } from '../lib/debug'

const log = logger('backend:server')

function publish(props: ServerState) {
  busServer(props)
  log.debug('==> Server started')
}

export default publish
