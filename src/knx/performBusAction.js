/* @flow */

import type { MinimalAddress } from '../types.js'
import knxd from 'eibd'
import * as R from 'ramda'
import config from '../config/index.js'
import { deriveAddrFormat } from './knx-lib.js'
import { logger } from '../lib/debug.js'

const log = logger('backend:bus')

function defaultCallback(err) {
  if (err) {
    log.error('Error communicating with KNXd.')
    throw err
  }
  log.debug('Success sending APDU to KNXd.')
}

const isWriteOnly = (action) => action === 'write'
const knxReadMsg = R.unary(knxd.createMessage)
const knxWriteMsg = R.partial(knxd.createMessage, ['write'])

function sendReqToBusFor(action, datatype, address: MinimalAddress, callback = defaultCallback) {
  const conn = knxd.Connection() /* eslint new-cap: "off" */
  const addrId = knxd.str2addr(address.id)
  const conf = config.knxd

  conn.socketRemote(conf, () => {
    conn.openTGroup(addrId, isWriteOnly(action), (err) => {
      if (err) {
        return callback(err)
      }
      const msg =
        action === 'read' /* as long as there is only read & write... */
          ? knxReadMsg(action)
          : knxWriteMsg(datatype, address.value)
      return conn.sendAPDU(msg, callback(null))
    })
  })
}

/* Do not really try to read/write to KNX-bus, just simulate it - good for testing / debugging */
function fakeReqToBusFor(action, datatype, address: MinimalAddress, callback = defaultCallback) {
  log.debug(
    `*Fakeing* <${action}> bus-request to address ${address.id} with value [${address.value}] and datatype <${datatype}>`
  )
  setTimeout(callback, 250, null)
}

const readAddr = R.partial(sendReqToBusFor, ['read', null])
const writeAddr = R.partial(config.commands.simulate ? fakeReqToBusFor : sendReqToBusFor, ['write'])

export function readGroupAddr(address: MinimalAddress, callback: Function = defaultCallback) {
  return readAddr(address, callback)
}

export function writeGroupAddr(address: MinimalAddress, callback: Function = defaultCallback) {
  const fmt = deriveAddrFormat(address)
  log.debug(`PerformBusAction: Writing to address ${address.id} in format <${fmt}>`)
  if (!fmt) {
    return callback(new Error(`Unknown address-format for address <${address.id}>`))
  }
  return writeAddr(fmt, address, callback)
}
