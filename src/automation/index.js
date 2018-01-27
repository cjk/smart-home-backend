// @flow

import type { ServerState } from '../types';
import K from 'kefir';
import logger from 'debug';

import env from './environment';
import affectedEnvEntries from './events';
import { assoc, filter, map, merge, pipe } from 'ramda';

const debug = logger('smt:automate');

// TODO: usefull?!
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
        // debug(busEvent);
        // debug(busState);
        // eventLoop(busEvent);
        const event = busEvent.toJS();
        const state = busState.toJS();
        return { event, state };
      })
        .scan((prev, next) => {
          const { event } = next;
          debug(`environment: \n ${JSON.stringify(env)}`);
          const envNext = map(
            entry => entry.action(env, event.value),
            affectedEnvEntries(event.dest)
          );
          debug(envNext);
        })
        .log();
      debug('Automation started');
    },
  };
}

export default automation;
