// @flow

/* Implements a (knx-) event-source for the KNXd. This requires you have KNXd
   running somewhere on your network.
 */

import type { Emitter } from 'kefir';
import type { AddressMap, KnxdOpts } from '../types';

import * as R from 'ramda';
import logger from 'debug';
import knxd from 'eibd';
import config from '../config';
import createEvent from './event';
import { getTimestamp } from '../lib/debug';

const debug = logger('smt:knx'),
  error = logger('error');

/* Identify name of the event's associated address to make debug-output more readable */
const addrMap: AddressMap = config.knx.addressMap;

const addrNameFor = addrId => R.path([addrId, 'name'], addrMap);

const _eventHandler = (emitter, eventType, src, dest, type, val) => {
  try {
    debug(
      `[${getTimestamp()}] <${eventType}> from ${src} to ${dest} (${addrNameFor(
        dest
      )}): ${val} [${type}]`
    );
  } catch (e) {
    if (e instanceof TypeError) {
      error(
        `WARNING: Unknown or invalid knx-address <${dest}> with value <${val}>\n- consider updating your address-list.`
      );
    } else {
      error(
        `ERROR: Unexpected exception on trying to parse knx-event of type <${type}> from source <${src}> for destination <${dest}>`
      );
    }
    return;
  }
  emitter.emit(createEvent(eventType, src, dest, type, val));
};

const eventHandler = R.curry(_eventHandler);

function listener(emitter) {
  const emittingEventHandler = eventHandler(emitter);
  const [writeHandler, responseHandler, readHandler] = [
    emittingEventHandler('write'),
    emittingEventHandler('response'),
    emittingEventHandler('read'),
  ];

  return parser => {
    /* TODO: Once EIBd#openGroupSocket allows for an err-object, we can start
       emmiting errors when needed: */
    /* if (err) {
       emitter.error(err);
       } else { ... */
    parser.on('write', writeHandler);
    parser.on('response', responseHandler);
    parser.on('read', readHandler);
    // DEBUGGING
    // parser.on('telegram', (eType, src, dest, val) => {
    //   debug(`--> ${eType} / ${src}:${dest} - <${JSON.stringify(val)}>`);
    // });
  };
}

/* Used to call into EIBd#openGroupSocket using the callback-function defined
   above.

   We implement error-handling here, since eibd throws strange messages when
   connecting fails (i.e. KNXd is down)! */
function groupSocketListen(opts, callback) {
  const conn = knxd.Connection();

  conn.socketRemote(opts, err => {
    if (err) {
      error('ERROR connecting to remote KNXd: ', err);
      return callback(err);
    }

    return conn.openGroupSocket(0, callback);
  });
}

export default function knxdSource(opts: KnxdOpts) {
  return (emitter: Emitter<>) => groupSocketListen(opts, listener(emitter));
}
