// @flow

import type { HomeState, ServerState, BusEvent, Environment, EnvTransform } from '../types';

import * as R from 'ramda';
import K from 'kefir';

import initialEnv from './environment';
import affectedEnvEntries from './transforms';
import { logger } from '../lib/debug';

const log = logger('backend:automate');

function automation() {
  return {
    start: (serverState: ServerState) => {
      log.debug('Starting automation...');
      const { busEvent$, busState$ } = serverState.streams;

      K.combine([busEvent$], [busState$], (event: BusEvent, state: HomeState) => ({
        event,
        state,
        env: initialEnv,
      }))
        .scan((prev, next) => {
          // Update environment from bus-state-events
          const { event } = next;
          const env = R.merge(next.env, prev.env);

          const transformEnvEntries = R.map((transform: EnvTransform): Environment =>
            transform.action(event, env)
          );
          const updateEnvironment: Environment[] = R.reduce((acc, t) => R.merge(env, t), env);

          const envNext = R.pipe(transformEnvEntries, updateEnvironment)(
            affectedEnvEntries(event.dest)
          );
          return R.assoc('env', envNext, next);
        })
        .onValue(v => log.debug(v.env));
      log.debug('Automation started');
    },
  };
}

export default automation;
