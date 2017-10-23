/* @flow */

import type { ServerState } from '../../types';

import handleBusWrites from './handleBusWrites';
import handleBusEvents from './handleBusEvents';
import updateRemoteInitialState from './handleInitialState';

function busServer(props: ServerState) {
  const { streams, client } = props;
  const { busEvent$, busState$ } = streams;

  updateRemoteInitialState(client, busState$);
  handleBusWrites(client);
  handleBusEvents(client, busEvent$);
}

export default busServer;
