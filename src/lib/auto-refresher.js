/* @flow */
import type { Address, AddressMap, AddressList, BusState$ } from '../types';

import { filter, isNil, map, pipe, prop, sortBy, take, values } from 'ramda';
import Kefir from 'kefir';
import busScanner from './bus-scanner';
import { getTimestamp, logger } from './debug';

const log = logger('backend:refresher');

const runDelaySeconds = 60; // Startup delay
const maxRefreshLimit = 4;
const maxAddressAge = 40; // Maxium age in minutes before an address gets refreshed
const sortByVerificationAge = sortBy(prop('verifiedAt'));

const reduceAddressesToIds = addrMap => map(prop(['id']), addrMap);

function refreshStaleAddresses(stream: BusState$) {
  /* Check address-timestamps every n seconds */
  const timer = Kefir.withInterval(runDelaySeconds * 1000, emitter => {
    emitter.emit();
  });

  stream.sampledBy(timer).onValue((addrMap: AddressMap) => {
    const now = Date.now();
    const staleAddrList: AddressList = pipe(
      values,
      /* Refresh only switches and sensors, exclude scenes and adresses with a feedback-address (can cause ghost-traffic on the bus??!) -
       * see https://knx-user-forum.de/forum/%C3%B6ffentlicher-bereich/knx-eib-forum/15169-lesen-einer-ga-f%C3%BChrt-zum-fahren-von-rolladen */
      filter(
        (addr: Address) =>
          (addr.type === 'switch' || addr.type === 'sensor') &&
          isNil(addr.fbAddr) &&
          !(addr.func === 'scene')
      ),
      /* Convert time-span to seconds and compare to max allowed age */
      filter((addr: Address) => Math.floor((now - addr.verifiedAt) / 1000) > maxAddressAge * 60),
      sortByVerificationAge
    )(addrMap);

    /* DEBUGGING: */
    if (staleAddrList.length > 0) {
      log.debug(
        `[${getTimestamp()}]: We have ${
          staleAddrList.length
        } stale addresses: ${reduceAddressesToIds(staleAddrList).join(
          '|'
        )} - refreshing a max of ${maxRefreshLimit} of these.`
      );
    } else {
      log.debug(`[${getTimestamp()}]: All addresses up to date - nothing to do :)`);
    }
    pipe(values, take(maxRefreshLimit), busScanner)(staleAddrList);
  });
}

export default refreshStaleAddresses;
