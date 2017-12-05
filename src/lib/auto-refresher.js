/* @flow */
import type { BusState } from '../types';

import logger from 'debug';
import Kefir from 'kefir';
import { isNil, pipe, take, values } from 'ramda';
import busScanner from './bus-scanner';
import { List } from 'immutable';
import { getTimestamp } from './debug';

const debug = logger('smt:refresher');

const runDelaySeconds = 60; // sane default is 60
const maxRefreshLimit = 6;
const maxAddressAge = 25; // Maxium age in minutes before an address gets refreshed

const reduceAddressesToIds = addrMap =>
  addrMap.reduce((lst, addr) => lst.push(addr.get('id')), new List()).sort();

function refreshStaleAddresses(stream: BusState) {
  /* Check address-timestamps every n seconds */
  const timer = Kefir.withInterval(runDelaySeconds * 1000, emitter => {
    emitter.emit();
  });

  stream.sampledBy(timer).onValue(addresses => {
    const now = Date.now();
    const staleAddresses = addresses
      /* Refresh only switches and sensors, exclude scenes and adresses with a feedback-address (can cause ghost-traffic on the bus??!) -
       * see https://knx-user-forum.de/forum/%C3%B6ffentlicher-bereich/knx-eib-forum/15169-lesen-einer-ga-f%C3%BChrt-zum-fahren-von-rolladen */
      .filter(
        addr =>
          (addr.type === 'switch' || addr.type === 'sensor') &&
          isNil(addr.fbAddr) &&
          !(addr.func === 'scene')
      )
      /* Convert time-span to seconds and compare to max allowed age */
      .filter(
        addr =>
          Math.floor((now - addr.get('verifiedAt')) / 1000) > maxAddressAge * 60
      )
      .sortBy(v => v.verifiedAt);

    /* DEBUGGING: */
    if (staleAddresses.size > 0) {
      debug(
        `[${getTimestamp(Date.now())}]: We have ${
          staleAddresses.size
        } stale addresses: ${reduceAddressesToIds(staleAddresses).join(
          '|'
        )} - refreshing a max of ${maxRefreshLimit} of these.`
      );
    } else {
      debug(
        `[${getTimestamp(
          Date.now()
        )}]: All addresses up to date - nothing to do :)`
      );
    }
    //       debug(staleAddresses.map(a => a.get('id')).toJS());

    pipe(values, take(maxRefreshLimit), busScanner)(staleAddresses.toJS());
  });
}

export default refreshStaleAddresses;
