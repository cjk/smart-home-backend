// @flow

import suncalc from 'suncalc';
import { DateTime } from 'luxon';

const times = suncalc.getTimes(new Date(), 48.6, 9.1);
// { solarNoon: 2018-04-24T11:22:53.986Z,
//   nadir: 2018-04-23T23:22:53.986Z,
//   sunrise: 2018-04-24T04:17:39.192Z,
//   sunset: 2018-04-24T18:28:08.779Z,
//   sunriseEnd: 2018-04-24T04:21:05.443Z,
//   sunsetStart: 2018-04-24T18:24:42.528Z,
//   dawn: 2018-04-24T03:43:27.253Z,
//   dusk: 2018-04-24T19:02:20.718Z,
//   nauticalDawn: 2018-04-24T03:00:53.062Z,
//   nauticalDusk: 2018-04-24T19:44:54.909Z,
//   nightEnd: 2018-04-24T02:12:48.270Z,
//   night: 2018-04-24T20:32:59.701Z,
//   goldenHourEnd: 2018-04-24T05:00:49.011Z,
//   goldenHour: 2018-04-24T17:44:58.960Z }

// now you can e.g.:
const localSunrise = DateTime.fromISO(times.sunrise.toISOString());
// result:
// DateTime {
//   ts: 2018-04-24T06:17:39.192+02:00,
//   zone: Europe/Berlin,
//   locale: en-US }
