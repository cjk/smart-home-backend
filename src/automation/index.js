// @flow

import type { ServerState } from '../types';
import K from 'kefir';
import logger from 'debug';

import env from './environment';
import { assoc, filter, map, pipe } from 'ramda';

const debug = logger('smt:automate');

const eventLoop = event => {
  pipe(
    filter(r => r.actSrc === '12/0/1'),
    map(room => {
      const newR = assoc('lastActivity', Date.now(), room);
      debug(newR);
      debug(newR.hasActivity(newR.lastActivity));
    })
  )(env.rooms);
};

function automation() {
  return {
    start: (serverState: ServerState) => {
      debug('Starting automation...');
      const { busEvent$, busState$ } = serverState.streams;

      K.combine([busEvent$], [busState$], (busEvent, busState) => {
        debug(busEvent);
        debug(busState);
        eventLoop(busEvent);
      }).log();
      debug('Automation started');
    },
  };
}

export default automation;
