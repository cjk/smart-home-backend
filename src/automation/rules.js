// @flow

import type { AutomataStateProps } from '../types';

import * as R from 'ramda';
import { logger } from '../lib/debug';

const log = logger('backend:rules');

const runTask = (onOrOff: boolean) => {
  console.log(`Running task with <${onOrOff.toString()}> decicsion`);
};

const rulesLst = [
  {
    name: 'Heizraum-Licht Auto',
    on: ({ env, busState }: AutomataStateProps) => {
      const lstActive = R.path(['rooms', 'cel-1', 'lastActivity'], env);
      const isTargetOff = R.propSatisfies(
        v => R.isNil(v) || v === 0,
        'value',
        R.prop('1/1/9', busState)
      );
      // Return true if there is an lastActivity-timestamp for Cel-1 and the activity occured within the last 10
      // seconds:
      const onOrOff = R.isNil(lstActive) ? false : isTargetOff && Date.now() - lstActive < 10000;
      return onOrOff;
    },
    // off: timeMidnight,
    act: (cond: boolean) => runTask(cond),
  },
];

export default rulesLst;
