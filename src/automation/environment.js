// Defines an environment-structure that is derived from sensor-data and the current bus-state

// TODO: add flow declarations

export default {
  dayTime: {
    outsideLight: 1000,
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
    wz: {
      actSrc: '0/0/0',
      temp: 21.5, // Room temperature
      lastActivity: null, // Last time activity was detected
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10, // Someone in the room right now?
    },
    knd1: {
      actSrc: '12/0/1',
      temp: 20,
      lastActivity: null,
      hasActivity: lastActTs => (Date.now() - lastActTs) / 1000 < 10,
    },
  },
  doors: {}, // open and closed doors; TODO: need door-sensors for that (reed-contacts)
};
