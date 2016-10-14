import Kefir from 'kefir';
import {readGroupAddr} from '../knx/performBusAction';

export default function scanBusAddr(addresses) {
  /* NOTE: We're expecting a plain JS-array of address-IDs here right now - make
     sure you convert your immutable-List et.al. prior to calling the bus-scanner. */
  const scanner = Kefir.sequentially(500, addresses)
                       .map(addr => readGroupAddr(addr));
  scanner.onValue(() => {});
  //   scanner.log();
}
