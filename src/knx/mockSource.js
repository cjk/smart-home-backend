// @flow

/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import type { Emitter } from 'kefir';
import type { KnxdOpts } from '../types';

import logger from 'debug';
import Kefir from 'kefir';
import createEvent from './event';

const debug = logger('smt:backend');

const getTimestamp = () => new Date().toISOString().slice(0, 19);

const stream = Kefir.later(
  1000,
  createEvent('read', '99.99.99', '0.0.7', 'switch', Math.round(Math.random()))
);

export default function mockSource(opts: KnxdOpts) {
  return (emitter: Emitter<*>) => {
    /* generate mocked events from stream */
    stream.onValue(e => {
      debug(`[${getTimestamp()}] Read from ${e.src} to ${e.dest}`);
      emitter.value(e);
    });
    return () => {};
  };
}
