// @flow

import type { AutomataStateProps, BusEvent, Environment, EnvTransform } from '../types';

import * as R from 'ramda';

const transforms: EnvTransform[] = [
  {
    name: 'outsideLight',
    on: ['6/0/0'],
    action: (event: BusEvent, env: Environment) =>
      R.assocPath(['outside', 'ambientLight'], event.value, env),
  },
  {
    name: 'ambientLightCel1',
    on: ['6/0/1'],
    action: (event: BusEvent, env: Environment) =>
      R.assocPath(['rooms', 'cel-1', 'ambientLight'], event.value, env),
  },
  {
    name: 'windowOpenCel2',
    on: ['10/0/10'],
    action: (event: BusEvent, env: Environment) =>
      R.assocPath(['rooms', 'cel-2', 'windowsOpen'], event.value, env),
  },
  {
    name: 'activityInWz',
    on: ['13/1/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? R.assocPath(['rooms', 'wz', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInHall1',
    on: ['13/1/1'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? R.assocPath(['rooms', 'hall-1', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInHall2',
    on: ['13/0/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? R.assocPath(['rooms', 'hall-2', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInHby',
    on: ['13/2/0'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? R.assocPath(['rooms', 'hby', 'lastActivity'], Date.now(), env) : env,
  },
  {
    name: 'activityInCel1',
    on: ['13/2/1'],
    action: (event: BusEvent, env: Environment) =>
      event.value === 1 ? R.assocPath(['rooms', 'cel-1', 'lastActivity'], Date.now(), env) : env,
  },
];

// Return all events, that have the given address-/string in one of their 'on'-keys
const affectedEnvEntries = (busEventId: string): Array<EnvTransform> =>
  R.filter(event => R.any(trigger => trigger === busEventId)(R.prop('on', event)), transforms);

// Merge old into new environment and apply logic from transforms that match the event-address
function applyEnvTransforms(prev: AutomataStateProps, next: AutomataStateProps) {
  // Updates environment from a stream of bus-state-events...
  const env = R.merge(next.env, prev.env);
  const { event } = next;

  const transformEnvEntries = R.map((transform: EnvTransform): Environment =>
    transform.action(event, env)
  );
  const updateEnvironment: Environment[] = R.reduce((acc, t) => R.merge(env, t), env);
  const envNext = R.pipe(transformEnvEntries, updateEnvironment)(affectedEnvEntries(event.dest));

  // ...and return updated environment + dummy event (Reason for dummy-event: to prevent same event is re-applied on
  // next tick, which may be before an actual new event occurs!)
  return R.pipe(R.assoc('env', envNext), R.assoc('event', { dest: '0/0/0' }))(next);
}

export default applyEnvTransforms;
