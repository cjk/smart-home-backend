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
  host: string,
  port: string,
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
};

export type ServerProps = {
  conf: Config,
  streams: {
    [string]: [BusEvent, BusState],
  },
  client: Function,
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
  tasks: Array<CrontabTask>,
};

export type Crontab = Array<CronJob>;

export type Scene = {
  id: string,
  name: string,
  lastRun: ?number,
  tasks: Array<CrontabTask>,
};
export type Scenes = Array<Scene>;

// TODO: Describe in more detail
export type HomeState = Object;

export type AppState = {
  crontab: Crontab,
  state: HomeState,
  taskEvents: Array<Task>,
};
