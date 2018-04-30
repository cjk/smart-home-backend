// @flow

// NOTE: Flow annotations are incomplete here as long as Flow doesn't support destructuring of Arrays and Objects into
// individual parameters during function calls - see https://github.com/facebook/flow/issues/235

import type { AutomataStateProps, BusEvent, Environment, EnvTransform, HomeState } from '../types';

import * as R from 'ramda';
import { addrValueToBoolean } from '../knx/knx-lib';
import { logger } from '../lib/debug';

const log = logger('backend:automate:transform');

const updateRoomActivityIn = (room: string, isActive: boolean, env): Environment => {
  const roomPath = ['rooms', room];
  return isActive
    ? R.pipe(
        R.assocPath([...roomPath, 'lastActivity'], Date.now()),
        R.assocPath([...roomPath, 'hasActivity'], true)
      )(env)
    : R.assocPath([...roomPath, 'hasActivity'], false, env);
};

const transforms: EnvTransform[] = [
  {
    name: 'outsideLight',
    on: ['6/0/0'],
    // $FlowFixMe
    action: ({ event, env }): Environment =>
      R.assocPath(['outside', 'ambientLight'], event.value, env),
  },
  {
    name: 'ambientLightCel1',
    on: ['6/0/1'],
    // $FlowFixMe
    action: ({ event, env }) => R.assocPath(['rooms', 'cel-1', 'ambientLight'], event.value, env),
  },
  {
    name: 'windowOpenCel2',
    on: ['10/0/10'],
    // $FlowFixMe
    action: ({ event, env }) => R.assocPath(['rooms', 'cel-2', 'windowsOpen'], event.value, env),
  },
  {
    name: 'activityInWz',
    on: ['13/1/0'],
    // $FlowFixMe
    action: ({ event, env }) => updateRoomActivityIn('wz', addrValueToBoolean(event), env),
  },
  {
    name: 'activityInHall1',
    on: ['13/1/1'],
    // $FlowFixMe
    action: ({ event, env }) => updateRoomActivityIn('hall-1', addrValueToBoolean(event), env),
  },
  {
    name: 'activityInHall2',
    on: ['13/0/0'],
    // $FlowFixMe
    action: ({ event, env }) => updateRoomActivityIn('hall-2', addrValueToBoolean(event), env),
  },
  {
    name: 'activityInHby',
    on: ['13/2/0'],
    // $FlowFixMe
    action: ({ event, env }) => updateRoomActivityIn('hby', addrValueToBoolean(event), env),
  },
  {
    name: 'activityInCel1',
    on: ['13/2/1'],
    // $FlowFixMe
    action: ({ event, env }) => updateRoomActivityIn('cel-1', addrValueToBoolean(event), env),
  },
  {
    name: 'lightsOffWz',
    on: ['1/2/4', '1/2/13', '1/2/14', '1/2/10', '1/2/15'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'wz', 'lightsOff'],
        R.not(
          R.any(light => R.path([light, 'value'], busState) === 1, [
            '1/2/4',
            '1/2/13',
            '1/2/14',
            '1/2/10',
            '1/2/15',
          ])
        ),
        env
      ),
  },
  {
    name: 'lightsOffKit',
    on: ['1/2/1', '1/2/7', '9/0/3'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'kit', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/2/1', '1/2/7'])),
        env
      ),
  },
  {
    name: 'lightsOffBath',
    on: ['1/3/3', '1/3/10'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'bath', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/3/3', '1/3/10'])),
        env
      ),
  },
  {
    name: 'lightsOffKnd1',
    on: ['1/3/0', '1/3/12'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'knd-1', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/3/0', '1/3/12'])),
        env
      ),
  },
  {
    name: 'lightsOffKnd2',
    on: ['1/3/1', '11/2/0'], // ceiling-light, switchable outlet
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'knd-2', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/3/1', '11/2/0'])),
        env
      ),
  },
  {
    name: 'lightsOffHby',
    on: ['1/1/5'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'hby', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/1/5'])),
        env
      ),
  },
  {
    name: 'lightsOffCel1',
    on: ['1/1/9'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'cel-1', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/1/9'])),
        env
      ),
  },
  {
    name: 'lightsOffCel2',
    on: ['1/1/6'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'cel-2', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/1/6'])),
        env
      ),
  },
  {
    name: 'lightsOffCel3',
    on: ['1/1/7'],
    // $FlowFixMe
    action: ({ busState, env }): Environment =>
      R.assocPath(
        ['rooms', 'cel-3', 'lightsOff'],
        R.not(R.any(light => R.path([light, 'value'], busState) === 1, ['1/1/7'])),
        env
      ),
  },
];

// Return all events, that have the given address-/string in one of their 'on'-keys
const affectedEnvEntries = (busEventId: string): Array<EnvTransform> =>
  R.filter(event => R.any(trigger => trigger === busEventId)(R.prop('on', event)), transforms);

// Merge old into new environment and apply logic from transforms that match the event-address
function applyEnvTransforms(prev: AutomataStateProps, next: AutomataStateProps) {
  // Updates environment from a stream of bus-state-events...
  const env = R.merge(next.env, prev.env);
  const { event, busState } = next;

  const transformEnvEntries = R.map((transform: EnvTransform): Environment =>
    // $FlowFixMe
    transform.action({ event, env, busState })
  );
  const updateEnvironment: Environment[] = R.reduce((acc, t) => R.merge(env, t), env);
  const envNext = R.pipe(transformEnvEntries, updateEnvironment)(affectedEnvEntries(event.dest));

  // ...and return updated environment + remove event-object (to prevent same event is re-applied on next tick)
  return R.pipe(R.assoc('env', envNext), R.dissoc('event'))(next);
}

export default applyEnvTransforms;
