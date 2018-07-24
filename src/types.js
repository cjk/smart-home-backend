// @flow

import type { Observable } from 'kefir'

export type BusState$ = Observable<Object>
export type BusEvent$ = Observable<Object>

export type AddressValue = number | number[] | typeof undefined

export type Address = {
  id: string,
  name: string,
  room: ?string,
  story: ?string,
  type: ?string,
  func: ?string,
  control?: ?string,
  fbAddr?: string,
  value: ?AddressValue,
  updatedAt?: number,
  verifiedAt?: number,
}

/* Minimal address with properties required e.g. for writing to the KNX-bus */
export type MinimalAddress = {
  id: string,
  name?: string,
  room?: ?string,
  story?: ?string,
  type: ?string,
  func: ?string,
  control?: ?string,
  fbAddr?: string,
  value: AddressValue,
  updatedAt?: number,
  verifiedAt?: number,
}

export type AddressMap = { [id: string]: Address }
export type AddressList = Array<Address>

export type KnxdOpts = {
  host: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
  port: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
  isAvailable: boolean,
}

export type KnxConf = {
  addressList: AddressList,
  addressMap: AddressMap,
  readableAddrMap: AddressMap,
}

export type BusEvent = {
  dest: string,
  value: number | number[],
  src: string,
  type: string,
  action: string,
  created: number,
}

export type Config = {
  server: {
    port: string,
  },
  knxd: KnxdOpts,
  wsServer: {
    host: string,
    port: string,
    user: string,
  },
  commands: {
    simulate: boolean,
  },
  logging: {
    logBusStateOnEvent: boolean,
    logBusEvents: boolean,
  },
  modules: {
    addressRefresher: boolean,
  },
  knx: KnxConf,
  version: string,
}

export type Callback = (err: ?Error, res: Object) => void

// Cron types

export type Task = {
  id: number,
  status: string,
  startedAt: ?number,
  endedAt: ?number,
  target: string,
  act: string,
}

export type TaskEvent = Task & { jobId: string }

export type CrontabTask = {
  targets: Array<string>,
  act: string,
}

export type CronJob = {
  jobId: string,
  name: string,
  at: string,
  repeat: string,
  scheduled: boolean,
  running: boolean,
  lastRun: Date | null,
  tasks: Array<CrontabTask | Task>,
}

export type Crontab = Array<CronJob>

export type HomeState = AddressMap

export type TickState = {
  crontab: Crontab,
  state: HomeState,
  taskEvents: Array<Task>,
  client: Function,
}

export type Scene = {
  id: string,
  name: string,
  tasks: Array<CrontabTask>,
}
export type Scenes = Array<Scene>

export type ServerState = {
  conf: Config,
  streams: {
    busState$: BusState$,
    busEvent$: BusEvent$,
  },
  client: Function,
  scenes: Scenes,
}

// Automate type, like environment and transforms
type roomEnv = {
  temp?: ?number,
  lastActivity: ?number,
  hasActivity: boolean,
  lightsOff: ?boolean,
}

export type Environment = {
  outside: {
    ambientLight: number,
    temp: number,
  },
  rooms: {
    [string]: roomEnv,
  },
  doors: Object,
  house: {
    alarm: boolean,
    empty: boolean,
  },
}

export type EnvTransform = {
  name: string,
  on: Array<string>,
  action: (BusEvent, Environment) => Environment,
}

// This is the data automata-modules receive from our bus-/state-streams along with each bus-event:
export type AutomataStateProps = {
  event: BusEvent,
  env: Environment,
  busState: HomeState,
}
