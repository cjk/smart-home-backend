// @flow

import K from 'kefir';
import logger from 'debug';
import { publishTime, timeFormatter } from './knx/time';

const debug = logger('smt:automate');

// Publish current time every 12 hours
const pubTimeInterval = 1000 * 60 * 60 * 12;

const automate = () => {
  K.withInterval(pubTimeInterval, emitter => {
    debug('Publishing current time to bus');
    emitter.emit(timeFormatter(new Date()));
  }).observe(publishTime);
};

export default automate;
