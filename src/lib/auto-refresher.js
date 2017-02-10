/* @flow */
import type {BusState} from '../types';
import Kefir from 'kefir';
import busScanner from './bus-scanner';
import {List} from 'immutable';
import {isNil} from 'ramda';
import {getTimestamp} from './debug'

const runDelaySeconds = 60; // sane default is 60
const maxRefreshLimit = 5;
const maxAddressAge = 20; // Maxium age in minutes before an address gets refreshed

const reduceAddressesToIds = (addrMap) =>
  addrMap.reduce((lst, addr) => lst.push(addr.get('id')), new List());


function refreshStaleAddresses(stream:BusState) {
  /* Check address-timestamps every n seconds */
  const timer = Kefir.withInterval(runDelaySeconds * 1000, (emitter) => {
    emitter.emit();
  });

  stream
    .sampledBy(timer)
    .onValue((addresses) => {
      const now = Date.now();
      const staleAddresses = addresses
      /* Exclude: Shutters (func=shut) and Adresses with a Feedback-Address since the latter can cause ghost-traffic on the bus -
       * see https://knx-user-forum.de/forum/%C3%B6ffentlicher-bereich/knx-eib-forum/15169-lesen-einer-ga-f%C3%BChrt-zum-fahren-von-rolladen */
        .filter(addr => !(addr.func === 'shut') && isNil(addr.fbAddr))
      /* Convert time-span to seconds and compare to max allowed age */
        .filter(addr => Math.floor((now - addr.get('updatedAt')) / 1000) > (maxAddressAge * 60))
        .sortBy(v => v.updatedAt);

      /* DEBUGGING: */
      if (staleAddresses.size > 0) {
        console.log(`[${getTimestamp(Date.now())}]-[AddressRefresher]: We have ${staleAddresses.size} stale addresses: ${reduceAddressesToIds(staleAddresses).sort().join('|')} - refreshing a max of ${maxRefreshLimit} of these.`);
      } else {
        console.log('[${getTimestamp(Date.now())}]-[AddressRefresher]: All addresses up to date - nothing to do :)');
      }
      //           console.log(staleAddresses.map(a => a.get('id')).toJS());

      busScanner(reduceAddressesToIds(staleAddresses.take(maxRefreshLimit)).toJS());
    })
  ;
}

export default refreshStaleAddresses;
