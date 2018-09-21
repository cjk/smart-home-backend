/* @flow */

import type { ServerState } from '../../types'

import handleBusWrites from './handleBusWrites'
import handleBusEvents from './handleBusEvents'
import updateRemoteInitialState from './handleInitialState'

function busServer(state: ServerState) {
  const { streams, client } = state
  const { busEvent$, busState$ } = streams

  updateRemoteInitialState(client, busState$)
  handleBusWrites(client)
  handleBusEvents(client, busEvent$)
}

export default busServer
