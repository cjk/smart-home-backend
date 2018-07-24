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
    name: 'WZ/Kitchen Licht Auto',
    on: ({ env }: AutomataStateProps) => {
      const wzEnv = R.path(['rooms', 'wz'], env);

      const lightsOffKitchen = R.path(['rooms', 'kit', 'lightsOff'], env);
      const { ambientLight } = env.outside;
      const { lastActivity, hasActivity, lightsOff } = wzEnv;

      // TODO: useful?
      // const isTargetOff = R.propSatisfies(
      //   v => R.isNil(v) || v === 0,
      //   'value',
      //   R.prop('1/1/9', busState)
      // );

      if (ambientLight > 500 || ambientLight < 0) {
        log.debug(
          `[WZ/Kitchen Licht Auto]: Not switching lights on: too bright outside or no data (${ambientLight}).`
        );
        return false;
      }

      if (!(lightsOffKitchen && lightsOff)) {
        log.debug(
          '[WZ/Kitchen Licht Auto] - Not switching lights on: Some lights in WZ/Kit already on or in unknown state.'
        );
        return false;
      }

      if (!hasActivity && Date.now() - lastActivity > 5000) {
        log.debug('[WZ/Kitchen Licht Auto] - Not switching lights on - no recent activity.');
        return false;
      }

      log.debug('[WZ/Kitchen Licht Auto] - Switching on Auto-lights!');
      return true;
    },
    // off: timeMidnight,
    act: (cond: boolean) => runTask(cond),
  },
];

export default rulesLst;
