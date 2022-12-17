// @flow

import K from 'kefir'
import { publishTime, timeFormatter } from './knx/time.js'
import { logger } from '../lib/debug.js'

const log = logger('backend:services')

// Publish current time every 12 hours
const pubTimeInterval = 1000 * 60 * 60 * 12

const services = () => {
  K.withInterval(pubTimeInterval, (emitter) => {
    log.debug('Publishing current time to bus')
    emitter.emit(timeFormatter(new Date()))
  }).observe(publishTime)
}

export default services
