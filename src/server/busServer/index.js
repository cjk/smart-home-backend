/* @flow */

import type { ServerProps } from '../../types';

import handleBusWrites from './handleBusWrites';
import handleBusEvents from './handleBusEvents';
// import TODO!
import updateRemoteInitialState from './handleInitialState';

function busServer(props: ServerProps) {
  const { streams, client } = props;
  const { busEvent$, busState$ } = streams;

  updateRemoteInitialState(client, busState$);
  handleBusWrites(client);
  handleBusEvents(client, busEvent$);
}

export default busServer;
