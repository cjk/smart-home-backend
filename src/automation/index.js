// @flow

import type { HomeState, ServerState, BusEvent, Environment, EnvTransform } from '../types';

import * as R from 'ramda';
import K from 'kefir';

import initialEnv from './environment';
import affectedEnvEntries from './transforms';

import rulesLst from './rules';

import { logger } from '../lib/debug';

const log = logger('backend:automate');

const ticker$ = K.interval(5000, { answer: 42 });

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
        .scan((prev, next) => {
          // Update environment from bus-state-events...
          const env = R.merge(next.env, prev.env);
          const { event } = next;

          log.debug('Current event: %O', event);
          log.debug('Previous event: %O', prev.event);

          const transformEnvEntries = R.map((transform: EnvTransform): Environment =>
            transform.action(event, env)
          );
          const updateEnvironment: Environment[] = R.reduce((acc, t) => R.merge(env, t), env);
          const envNext = R.pipe(transformEnvEntries, updateEnvironment)(
            affectedEnvEntries(event.dest)
          );

          // ...and return updated environment
          return R.pipe(R.assoc('env', envNext), R.assoc('event', { dest: '0/0/0' }))(next);
        })
        .observe({
          value(state) {
            log.debug('Value: %j', R.dissoc('busState', state));
          },
        });
      log.debug('Automation started');
    },
  };
}

export default automation;
