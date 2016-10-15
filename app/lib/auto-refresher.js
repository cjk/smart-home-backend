import {List} from 'immutable';
import Kefir from 'kefir';
import busScanner from './bus-scanner';

const maxRefreshLimit = 20;

function reduceAddressesToIds(addrMap) {
  return addrMap.reduce((lst, addr) => lst.push(addr.get('id')), new List());
}

function refreshStaleAddresses(stream) {
  /* Check address-timestamps every 30 secs */
  const timer = Kefir.withInterval(30000, (emitter) => {
    emitter.emit();
  });

  stream.sampledBy(timer)
        .onValue((addresses) => {
          const now = Date.now();
          const staleAddresses = addresses
            /* Exclude: Shutters (func=shut), Feedback (type=fb) */
            .filter(addr => !(addr.func === 'shut' || addr.type === 'fb'))
            /* Convert time-span to seconds and compare to max allowed age (600 = 10 min., 1200 = 20min. etc.) */
            .filter(addr => Math.floor((now - addr.get('updatedAt')) / 1000) > 1200)
            .sortBy(v => v.updatedAt);

          /* DEBUGGING: */
          console.log(`~~ Address-refresher: We have ${staleAddresses.size} stale addresses - refreshing a max of ${maxRefreshLimit} of these: ${reduceAddressesToIds(staleAddresses).join('|')}`);
          //           console.log(addresses.sortBy(v => v.updatedAt).take(20).toJS());

          busScanner(reduceAddressesToIds(staleAddresses.take(maxRefreshLimit)).toJS());
        })
  ;
}

export default refreshStaleAddresses;
