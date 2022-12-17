// @flow

/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import type { Emitter } from 'kefir'
import type { KnxdOpts } from '../types.js'

import Kefir from 'kefir'
import createEvent from './event.js'
import { logger } from '../lib/debug.js'

const log = logger('backend:mockSource')

const getTimestamp = () => new Date().toISOString().slice(0, 19)

const stream = Kefir.later(1000, createEvent('read', '99.99.99', '0.0.7', 'switch', Math.round(Math.random())))

export default function mockSource(opts: KnxdOpts) {
  return (emitter: Emitter<*>) => {
    /* generate mocked events from stream */
    stream.onValue((e) => {
      log.debug(`[${getTimestamp()}] Read from ${e.src} to ${e.dest}`)
      emitter.value(e)
    })
    return () => {}
  }
}
