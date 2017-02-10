/* eslint no-console: "off" */

/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import knxd from 'eibd';
import R from 'ramda';
import config from '../config';
import Event from './event';
import {getTimestamp} from '../lib/debug';

/* Identify name of the event's associated address to make debug-output more
   readable */
const addresses = config.knx.addressMap();

const addressFor = addrId => addresses.get(addrId).name;

function createEvent(action, src, dest, type, val) {
  return new Event({
    created: Date.now(),
    action,
    src,
    dest,
    type,
    value: val
  });
}

function _eventHandler(emitter, eventType, src, dest, type, val) {
  try {
    console.log(`[${getTimestamp()}] <${eventType}> from ${src} to ${dest} (${addressFor(dest)}): ${val} [${type}]`);
  } catch (e) {
    if (e instanceof TypeError) {
      console.log(`ERROR: Unknown or invalid knx-address <${dest}> - perhaps you need to add it to your address-list first?`);
    } else {
      console.log(`ERROR: Unexpected exception on trying to parse knx-event of type <${type}> from source <${src}> for destination <${dest}>`);
    }
    return;
  }
  emitter.emit(createEvent(eventType, src, dest, type, val));
}

const eventHandler = R.curry(_eventHandler);

function listener(emitter) {
  const emittingEventHandler = eventHandler(emitter);
  const [writeHandler, responseHandler, readHandler] = [emittingEventHandler('write'), emittingEventHandler('response'), emittingEventHandler('read')];

  return (parser) => {
    /* TODO: Once EIBd#openGroupSocket allows for an err-object, we can start
       emmiting errors when needed: */
    /* if (err) {
       emitter.error(err);
       } else { ... */
    parser.on('write', writeHandler);
    parser.on('response', responseHandler);
    parser.on('read', readHandler);
  };
}

/* Used to call into EIBd#openGroupSocket using the callback-function defined
   above.

   We implement error-handling here, since eibd throws strange messages when
   connecting fails (i.e. KNXd is down)! */
function groupSocketListen(opts, callback) {
  const conn = knxd.Connection();

  conn.socketRemote(opts, (err) => {
    if (err) {
      console.log('ERROR connecting to remote KNXd: ', err);
      return callback(err);
    }

    return conn.openGroupSocket(0, callback);
  });
}

export default function knxdSource(opts) {
  return emitter => groupSocketListen(opts, listener(emitter));
}
