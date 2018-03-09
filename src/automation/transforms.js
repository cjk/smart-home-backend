// @flow

import type { BusEvent, Environment, EnvTransform } from '../types';

import { any, assocPath, filter, prop } from 'ramda';

const transforms: EnvTransform[] = [
  {
    name: 'dayLight',
    on: ['6/0/0'],
    action: (event: BusEvent, env: Environment) =>
      assocPath(['dayTime', 'outsideLight'], event.value, env),
  },
  {
    name: 'activityInWz',
    on: ['13/1/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? assocPath(['rooms', 'wz', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'windowOpenCel2',
    on: ['10/0/10'],
    action: (event: BusEvent, env: Environment) =>
      assocPath(['rooms', 'cel-2', 'windowsOpen'], event.value, env),
  },
  {
    name: 'activityInHall1',
    on: ['13/1/1'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? assocPath(['rooms', 'wz', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInHall2',
    on: ['13/0/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? assocPath(['rooms', 'wz', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInHby',
    on: ['13/2/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? assocPath(['rooms', 'wz', 'lastActivity'], Date.now(), env) : env,
  },
];

// Return all events, that have the given address-/string in one of their 'on'-keys
const affectedEnvEntries = (busEventId: string): Array<EnvTransform> =>
  filter(event => any(trigger => trigger === busEventId)(prop('on', event)), transforms);

export default affectedEnvEntries;
