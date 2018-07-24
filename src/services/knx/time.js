// @flow

import { createAddress, dateTimeToDPT10Array } from '../../knx/knx-lib'
import { writeGroupAddr } from '../../knx/performBusAction'
import { logger } from '../../lib/debug'

const log = logger('backend:knxPublishTime')

const timeFormatter = (ts: Date) => dateTimeToDPT10Array(ts)

const publishTime = (knxTime: number[]) => {
  const addr = createAddress({
    id: '8/0/5',
    type: 'clock',
    func: 'time',
    value: knxTime,
  })

  log.debug(`Sending time-event ${JSON.stringify(addr)}.`)
  writeGroupAddr(addr, err => {
    if (err) {
      log.debug(`Error writing time to KNX-bus: ${err}`)
    }
  })
}

export { publishTime, timeFormatter }
