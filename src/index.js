/* @flow */
import type { ServerState } from './types.js'

import config from './config/index.js'
import createBusStreams from './busStreams.js'
import { addrMapToConsole, logger } from './lib/debug.js'
import { createStore } from './store/index.js'
import setupCron from './cron/index.js'
import setupScenes from './scenes/index.js'
import startServices from './services/index.js'
import automation from './automation/index.js'

const log = logger('backend:main')

const { version } = config

// Allow for clean restarts (e.g. when using pm2 or other process managers)
const setupCleanupHandler = (store) => {
  process.on('SIGINT', () => {
    log.debug('Received SIGINT. Cleaning up and exiting...')
    store.shutdown()
    process.exit()
  })
}

/* PENDING / DEBUGGING: Enable better debugging until we're stable here */
process.on('unhandledRejection', (r) => log.error(r))

const { busEvent$, busState$ } = createBusStreams()

// Start bus-services, like setting the current time on the (knx-) bus
startServices()

// Load scenes from definitions-file and sync them to cloud, so other clients/frontends may use and invoke them
const scenes = setupScenes()

const serverState: ServerState = {
  conf: config,
  streams: {
    busEvent$,
    busState$,
  },
  scenes,
}

// Setup distributed store to save local and receive remote changes:
const store = createStore(serverState)

// On reload/restarts/interrupt cleanup state
setupCleanupHandler(store)

// TODO: The cron-engine was left as is after migrating from deepstream to gundb. Thus, both work rather inefficiently
// together; data needs to be transformed from/to the cron-engine, e.g. it makes use of arrays which gundb doesn't
// support.
// So consider refactoring the cron-engine for better GunDB-alignment, which should result uin much less glue-code!
/* Init + start chronological rules engine, including syncing with cloud */
setupCron(serverState, store)

automation().start(serverState)

log.debug(`Server [v${version}] initialized and up running`)

/* Start the stream by logging from it */
if (config.knxd.isAvailable) {
  busState$.map(addrMapToConsole)
}
