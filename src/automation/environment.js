// @flow

// Defines an environment-structure that is derived from sensor-data and the current bus-state

import type { Environment } from '../types';

const environment: Environment = {
  dayTime: {
    outsideLight: -1,
    itsDusk: false,
    itsDawn: false,
    itsDaylight: true,
    itsNight: false,
    itsEvening: false,
  },
  outside: {
    temp: 5.5, // TODO: outside-temperature
  },
  rooms: {
    'hall-1': {
      temp: null, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10, // Someone in the room right now?
    },
    'hall-2': {
      temp: null, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
    wz: {
      temp: 21.5, // Room temperature
      windowsOpen: 0,
      lastActivity: null, // Last time activity was detected
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
    knd1: {
      temp: 20,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
    'cel-1': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
    'cel-2': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
    hby: {
      temp: null, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10, // Someone in the room right now?
    },
  },
  doors: {}, // open and closed doors; TODO: need door-sensors for that (reed-contacts)
  house: {
    alarm: false,
    empty: false,
  },
};

export default environment;
