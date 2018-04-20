// @flow

// Defines an environment-structure that is derived from sensor-data and the current bus-state

import type { Environment } from '../types';

const hasActivity = lastActTs => (Date.now() - lastActTs) / 1000 < 10;

const environment: Environment = {
  outside: {
    ambientLight: -1,
    temp: -1,
  },
  rooms: {
    'hall-1': {
      temp: null, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity, // Someone in the room right now?
    },
    'hall-2': {
      temp: null,
      lastActivity: null,
      hasActivity,
    },
    wz: {
      temp: 21.5,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity,
    },
    knd1: {
      temp: 20,
      windowsOpen: 0,
      lastActivity: null,
      hasActivity,
    },
    'cel-1': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity,
      ambientLight: undefined,
    },
    'cel-2': {
      windowsOpen: 0,
      lastActivity: null,
      hasActivity,
    },
    hby: {
      temp: null,
      lastActivity: null,
      hasActivity,
    },
  },
  doors: {}, // open and closed doors; TODO: need door-sensors for that (reed-contacts)
  house: {
    alarm: false,
    empty: false,
  },
};

export default environment;
