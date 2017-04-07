/* @flow */

import type { ServerProps } from '../../types';

import handleBusWrites from './handleBusWrites';
import handleBusEvents from './handleBusEvents';
import updateRemoteInitialState from './handleInitialState';

function busServer(props: ServerProps) {
  const { streams, connection } = props;
  const { busEvent$, busState$ } = streams;

  updateRemoteInitialState(connection, busState$);
  handleBusWrites(connection);
  handleBusEvents(connection, busEvent$);
}

export default busServer;
