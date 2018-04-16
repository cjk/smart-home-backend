// @flow

import type { Address } from '../types';

const additionalAddrProps = {
  value: undefined,
  updatedAt: 1451606400000 /* choose guaranteed expired default value so sorting later becomes predictable */,
  verifiedAt: 1451606400000,
};

function createAddress(addr: Address) {
  return { ...additionalAddrProps, ...addr };
}

export default createAddress;
