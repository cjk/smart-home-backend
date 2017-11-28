// @flow

import type { Address, MinimalAddress } from '../types';

/* Guess correct KNX-datatype / format from address-properties */
function deriveAddrFormat(addr: Address) {
  if (addr.type !== 'switch') {
    return null;
  }

  /* For reference, see https://www.domotiga.nl/projects/selfbus-knx-eib/wiki/Datatypes */
  switch (addr.func) {
    case 'light':
      /* DPT1 - 1 bit (0,1) */
      return 'DPT1';

    case 'outlet':
      /* DPT1 - 1 bit (0,1) */
      return 'DPT1';

    case 'shut':
      /* DPT1 - 1 bit (0,1) */
      return 'DPT1';

    case 'inhibit':
      /* DPT2 - 1 bit (0,1) + value (0,1) */
      return 'DPT2';

    case 'scene':
      /* DPT17 or DPT5 - 1 byte unsigned (0-255) */
      return 'DPT5';

    case 'dim':
      /* DPT 3 - (Position, Control, Value)  1 Bit, 4 Bit, 8 Bit [0,0]...[1,7] */
      /* PENDING: 1 byte is used for (physical) knx-switches?! */
      break;

    case 'heat':
      /* DPT1 - 1 bit (0,1) */
      break;

    case 'time':
      /* DPT10 - 3 bytes (weekday+hour/minutes/seconds) */
      return 'DPT10';

    default:
      return undefined;
  }
  return undefined;
}

function createAddress(props: MinimalAddress): Address {
  const addressDefaults = {
    name: 'none',
    room: 'none',
    story: 'none',
    type: 'switch',
    func: 'light',
  };

  return Object.assign({}, addressDefaults, props);
}

export { createAddress, deriveAddrFormat };
