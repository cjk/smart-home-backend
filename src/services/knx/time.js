// @flow

import { createAddress, dateTimeToDPT10Array } from '../../knx/knx-lib';
import { writeGroupAddr } from '../../knx/performBusAction';
import logger from 'debug';

const debug = logger('smt:knxPublishTime');

const timeFormatter = (ts: Date) => dateTimeToDPT10Array(ts);

const publishTime = (knxTime: number[]) => {
  const addr = createAddress({
    id: '8/0/5',
    type: 'clock',
    func: 'time',
    value: knxTime,
  });

  debug(`Sending time-event ${JSON.stringify(addr)}.`);
  writeGroupAddr(addr, err => {
    if (err) {
      debug(`Error writing time to KNX-bus: ${err}`);
    }
  });
};

export { publishTime, timeFormatter };
