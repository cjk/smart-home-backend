// @flow

// Defines an environment-structure that is derived from sensor-data and the current bus-state

import type { Environment } from '../types'

const environment: Environment = {
  outside: {
    ambientLight: -1,
    temp: 0,
  },
  rooms: {
    'hall-1': {
      temp: null, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity: false, // Someone in the room right now?
      lightsOff: undefined,
    },
    'hall-2': {
      temp: null,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    kit: {
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    wz: {
      temp: 0,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    bath: {
      temp: 0,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    'knd-1': {
      temp: 0,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    'knd-2': {
      temp: 0,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    'cel-1': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      ambientLight: undefined,
      lightsOff: undefined,
    },
    'cel-2': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    'cel-3': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
    hby: {
      temp: null,
      lastActivity: null,
      hasActivity: false,
      lightsOff: undefined,
    },
  },
  doors: {}, // open and closed doors; TODO: need door-sensors for that (reed-contacts)
  house: {
    alarm: false,
    empty: false,
  },
}

export default environment
