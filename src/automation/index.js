// @flow

import type { HomeState, ServerState, BusEvent, Environment, EnvTransform } from '../types';
import K from 'kefir';
import logger from 'debug';

import initialEnv from './environment';
import affectedEnvEntries from './transforms';
import * as R from 'ramda';

const debug = logger('smt:automate');

function automation() {
  return {
    start: (serverState: ServerState) => {
      debug('Starting automation...');
      const { busEvent$, busState$ } = serverState.streams;

      K.combine([busEvent$], [busState$], (busEvent, busState) => {
        const event: BusEvent = busEvent.toJS();
        const state: HomeState = busState.toJS();
        return { event, state, env: initialEnv };
      })
        .scan((prev, next) => {
          // Update environment from bus-state-events
          const { event } = next;
          const env = R.merge(next.env, prev.env);

          const transformEnvEntries = R.map((transform: EnvTransform): Environment =>
            transform.action(event, env)
          );
          // TODO: R.reduce is not curried here - does this actually work for multiple environments?!
          const updateEnvironment: Environment[] = R.reduce((acc, t) => R.merge(env, t), env);

          const envNext = R.pipe(transformEnvEntries, updateEnvironment)(
            affectedEnvEntries(event.dest)
          );
          return R.assoc('env', envNext, next);
        })
        .onValue(v => {}); // TODO: debug(v.env)
      debug('Automation started');
    },
  };
}

export default automation;
