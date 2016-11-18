/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import Kefir from 'kefir';
import Event from './event';

const getTimestamp = () => new Date().toISOString().slice(0, 19);

const stream = Kefir.later(1000,
                           new Event(
                             {created: Date.now(), action: 'read', src: '99.99.99', dest: '0.0.7'}
                           ));

export default function mockSource(opts) {
  return (emitter) => {
    /* generate mocked events from stream */
    stream.onValue((e) => {
      console.log(`[${getTimestamp()}] Read from ${e.src} to ${e.dest}`);
      emitter.emit(e);
    });
    return () => {};
  };
}
