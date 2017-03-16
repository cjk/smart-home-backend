// @flow

import type { Observable } from 'kefir';

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

export type AddressList = Array<Address>;

export type Config = {
  server: {
    port: string,
  },
  knxd: {
    host: string,
    port: string,
    isAvailable: true,
  },
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
  knx: {
    addresses: AddressList,
    addressMap: () => {},
    readableAddr: Array<string>,
  },
};

export type ServerProps = {
  conf: Config,
  streams: {
    busEvents: BusEvent,
    busState: BusState,
  },
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

export type TaskEvent = Task & { jobId: number };

export type CrontabTask = {
  targets: Array<string>,
  act: string,
};

export type CronJob = {
  jobId: number,
  name: string,
  at: string,
  repeat: string,
  scheduled: boolean,
  running: boolean,
  lastRun: Date | null,
  tasks: Array<CrontabTask>,
};

export type Crontab = Array<CronJob>;

// TODO: Describe in more detail
export type HomeState = Object;

export type AppState = {
  crontab: Crontab,
  state: HomeState,
  taskEvents: Array<Task>,
};
