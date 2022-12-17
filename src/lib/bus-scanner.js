// @flow

import type { MinimalAddress } from '../types.js'

import Kefir from 'kefir'
import { readGroupAddr } from '../knx/performBusAction.js'

export default function scanBusAddr(addresses: Array<MinimalAddress>) {
  const scanner = Kefir.sequentially(500, addresses).map((addrId) => readGroupAddr(addrId))
  scanner.onValue(() => {})
  //   scanner.log();
}
