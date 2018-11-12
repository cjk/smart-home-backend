/* @flow */
import type { ServerState } from './types'

import config from './config'
import createBusStreams from './busStreams'
import { addrMapToConsole, logger } from './lib/debug'
import publish from './server'
import { createStore } from './store'
import setupCron from './cron'
import setupScenes from './scenes'
import startServices from './services'
import automation from './automation'

const log = logger('backend:main')

const { version } = config

// Allow for clean restarts (e.g. when using pm2 or other process managers)
const setupCleanupHandler = client => {
  process.on('SIGINT', () => {
    log.debug('Received SIGINT. Cleaning up and exiting...')
    client.shutdown()
    process.exit()
  })
}

/* PENDING / DEBUGGING: Enable better debugging until we're stable here */
process.on('unhandledRejection', r => log.error(r))

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

/* Setup and configure (websocket-/http-) server and pass event-emitters along
       for use in plugins et. al. */
// DEPRECATED: the store should take over all remote / communication work - see below.
// Also as of 30.10.2018 the publish-logic used 100% CPU after a while, thus it's deactivated for now!
// publish(serverState)
// Setup distributed store to save local and receive remote changes:
const store = createStore(serverState)

// On reload/restarts/interrupt cleanup state
setupCleanupHandler(store)

// TODO: REFACTOR
// /* Init + start chronological rules engine, including syncing with cloud */
// setupCron(serverState)

automation().start(serverState)

log.debug(`Server [v${version}] initialized and up running`)

/* Start the stream by logging from it */
if (config.knxd.isAvailable) {
  busState$.map(addrMapToConsole)
}
