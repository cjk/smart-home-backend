// @flow

import type { Environment, HomeState } from '../types';

import * as R from 'ramda';
import { logger } from '../lib/debug';

const log = logger('backend:rules');

const runTask = (name: string) => {
  console.log(`Running task <${name}>`);
};

const rulesLst = [
  {
    name: 'Heizraum-Licht Auto',
    on: (env: Environment, state: HomeState) => {
      const lstActive = R.path(['rooms', 'cel-1', 'lastActivity'], env);
      log.debug(state);
      const isOff = R.propSatisfies(v => R.isNil(v) || v === 0, 'value', R.prop('1/1/9', state));
      return R.isNil(lstActive) ? false : isOff(); // Date.now() - lstActive > 1000;
    },
    // off: timeMidnight,
    act: runTask,
  },
];

export default rulesLst;
