// @flow

// SmartHome-Backend realtime-automation engine
// Reacts on state-changes in our environment based on a rule-engine (see './rules.js')
// WIP: Currently in experimental state!

import type { AutomataStateProps, HomeState, ServerState, BusEvent } from '../types.js'

import * as R from 'ramda'
import K from 'kefir'

import initialEnv from './environment.js'
import applyEnvTransforms from './transforms.js'
import rulesLst from './rules.js'

import { logger } from '../lib/debug.js'

const log = logger('backend:automate')

// TODO: Tick-payload is as of now not strictly needed - see also 'tick' below!
const ticker$ = K.interval(5000, { from: Date.now() })

function automation() {
  return {
    start: (serverState: ServerState) => {
      log.debug('Starting automation...')
      const { busEvent$, busState$ } = serverState.streams

      K.combine([busEvent$, ticker$], [busState$], (event: BusEvent, tick, busState: HomeState) => ({
        event,
        tick,
        busState,
        env: initialEnv,
      }))
        .scan(applyEnvTransforms)
        .observe({
          value(stateProps: AutomataStateProps) {
            // DEBUGGING: log some state, like current environment, but exclude bus-state if not needed

            // Enable this to see current environment and state of our rule-engine on each tick:
            // log.debug('post-processed environment: %j', R.dissoc('busState', stateProps));
            R.map((rule) => log.debug(rule.on(stateProps)))(rulesLst)
          },
        })
      log.debug('Automation started')
    },
  }
}

export default automation
