// @flow

import type { Observable } from 'kefir';
import type { KeyedCollection } from 'immutable';

export type BusState = Observable<Object>;
export type BusEvent = Observable<Object>;

export type Address = {
  id: string,
  name: string,
  room: ?string,
  story: ?string,
  type: ?string,
  func: ?string,
  fbAddr?: string,
  value?: ?number,
};

/* Minimal address with properties required e.g. for writing to the KNX-bus */
export type MinimalAddress = {
  id: string,
  name?: string,
  room?: ?string,
  story?: ?string,
  type: ?string,
  func: ?string,
  fbAddr?: string,
  value: number,
};

export type AddressMap = { [id: string]: Address };
export type AddressList = Array<Address>;

export type KnxdOpts = {
  host: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
  port: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
  isAvailable: boolean,
};

export type KnxConf = {
  addresses: AddressList,
  addressMap: null => KeyedCollection<string, Address>,
  readableAddr: Array<string>,
};

export type Config = {
  server: {
    port: string,
  },
  knxd: KnxdOpts,
  wsServer: {
    host: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
    port: ?string, // NOTE: only optional because taking them from environment is not guaranteed to be non-empty
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
};

export type Callback = (err: ?Error, res: Object) => void;

// Cron types

export type Task = {
  id: number,
  status: string,
  startedAt: ?number,
  endedAt: ?number,
  target: string,
  act: string,
};

export type TaskEvent = Task & { jobId: string };

export type CrontabTask = {
  targets: Array<string>,
  act: string,
};

export type CronJob = {
  jobId: string,
  name: string,
  at: string,
  repeat: string,
  scheduled: boolean,
  running: boolean,
  lastRun: Date | null,
  tasks: ?(CrontabTask[]) | ?(Task[]),
};

export type Crontab = Array<CronJob>;

// TODO: Describe in more detail
export type HomeState = Object;

export type TickState = {
  crontab: Crontab,
  state: HomeState,
  taskEvents: Array<Task>,
  client: Function,
};

export type Scene = {
  id: string,
  name: string,
  tasks: Array<CrontabTask>,
};
export type Scenes = Array<Scene>;

export type ServerState = {
  conf: Config,
  streams: {
    busState$: BusState,
    busEvent$: BusEvent,
  },
  client: Function,
  scenes: Scenes,
};
