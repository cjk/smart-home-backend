// @flow

/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import type { Emitter } from 'kefir';
import type { KnxdOpts } from '../types';

import logger from 'debug';
import Kefir from 'kefir';
import Event from './event';

const debug = logger('smt-backend');

const getTimestamp = () => new Date().toISOString().slice(0, 19);

const stream = Kefir.later(
  1000,
  new Event({
    created: Date.now(),
    action: 'read',
    src: '99.99.99',
    dest: '0.0.7',
  })
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
