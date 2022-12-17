// @flow

import type { Address, MinimalAddress } from '../types.js'
import * as R from 'ramda'

const additionalAddrProps = {
  value: null,
  name: '__generated__',
  room: 'none',
  story: 'none',
  type: 'switch',
  func: 'light',
  control: 'none',
  updatedAt: 1451606400000 /* choose guaranteed expired default value so sorting later becomes predictable */,
  verifiedAt: 1451606400000,
}

function isCompleteAddress(addr: Object): boolean {
  const hasType = R.has('type')
  const hasFunc = R.has('func')
  const hasName = R.has('name')
  const hasId = R.has('id')

  return R.allPass([hasId, hasName, hasType, hasFunc])(addr)
}

function createAddress(addr: MinimalAddress): Address {
  return { ...additionalAddrProps, ...addr }
}

export { createAddress, isCompleteAddress }
