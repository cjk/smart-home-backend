// @flow
import type { KnxdOpts } from '../types.js'

import config from '../config/index.js'
import knxdSrc from './knxdSource.js'
import mockSrc from './mockSource.js'

const { host, port, isAvailable } = config.knxd
const opts: KnxdOpts = { host, port, isAvailable }

const knxListener = isAvailable ? knxdSrc(opts) : mockSrc(opts)

export default knxListener
