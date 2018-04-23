// @flow

import type { AutomataStateProps, HomeState, ServerState, BusEvent } from '../types';

import * as R from 'ramda';
import K from 'kefir';

import initialEnv from './environment';
import applyEnvTransforms from './transforms';

import rulesLst from './rules';

import { logger } from '../lib/debug';

const log = logger('backend:automate');

// TODO: Tick-payload is as of now not strictly needed - see also 'tick' below!
const ticker$ = K.interval(5000, { from: Date.now() });

function automation() {
  return {
    start: (serverState: ServerState) => {
      log.debug('Starting automation...');
      const { busEvent$, busState$ } = serverState.streams;

      K.combine(
        [busEvent$, ticker$],
        [busState$],
        (event: BusEvent, tick, busState: HomeState) => ({
          event,
          tick,
          busState,
          env: initialEnv,
        })
      )
        .scan(applyEnvTransforms)
        .observe({
          value(stateProps: AutomataStateProps) {
            log.debug('Value: %j', R.dissoc('busState', stateProps)); // log state, but without bus-state
            R.map(rule => log.debug(rule.on(stateProps)))(rulesLst);
          },
        });
      log.debug('Automation started');
    },
  };
}

export default automation;
