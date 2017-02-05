import Kefir from 'kefir';
import busScanner from './bus-scanner';
import {List} from 'immutable';
import {isNil} from 'ramda';

const runDelaySeconds = 20;
const maxRefreshLimit = 20;

function reduceAddressesToIds(addrMap) {
  return addrMap.reduce((lst, addr) => lst.push(addr.get('id')), new List());
}

function refreshStaleAddresses(stream) {
  /* Check address-timestamps every n seconds */
  const timer = Kefir.withInterval(runDelaySeconds * 1000, (emitter) => {
    emitter.emit();
  });

  stream.sampledBy(timer)
        .onValue((addresses) => {
          const now = Date.now();
          const staleAddresses = addresses
          /* Exclude: Shutters (func=shut) and Adresses with a Feedback-Address since the latter can cause ghost-traffic on the bus -
           * see https://knx-user-forum.de/forum/%C3%B6ffentlicher-bereich/knx-eib-forum/15169-lesen-einer-ga-f%C3%BChrt-zum-fahren-von-rolladen */
            .filter(addr => !(addr.func === 'shut') && isNil(addr.fbAddr))
            /* Convert time-span to seconds and compare to max allowed age (600 = 10 min., 1200 = 20min. etc.) */
            .filter(addr => Math.floor((now - addr.get('updatedAt')) / 1000) > 1200)
            .sortBy(v => v.updatedAt);

          /* DEBUGGING: */
          if (staleAddresses.size > 0) {
            console.log(`~~ Address-refresher: We have ${staleAddresses.size} stale addresses - refreshing a max of ${maxRefreshLimit} of these: ${reduceAddressesToIds(staleAddresses).join('|')}`);
          } else {
            console.log('~~ Address-refresher: All addresses up to date - nothing to do :)');
          }
          //           console.log(staleAddresses.map(a => a.get('id')).toJS());

          busScanner(reduceAddressesToIds(staleAddresses.take(maxRefreshLimit)).toJS());
        })
  ;
}

export default refreshStaleAddresses;
