# Home-automation service backend written in Javascript.

- Written to automate and interact with a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based Bus-system. Other bus-components / standards may follow.

- This service is meant to collect and interact with your KNX home installation and send an information-stream of events to a [frontend](https://github.com/cjk/smart-home-app) for visualization.

- Right now expects a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based backend, but this can be changed pretty easily if your home runs on something else.

- Uses Websockets to communicate with a realtime datastore (GunDB) so you can exchange messages with the bus real fast and bi-directional.

- Built using modern functional reactive technologies, for clean, readable code and easy to understand program-flow.

This is a NodeJS CLI application, in order to visualize what is going on on your home-bus and to send commands, you need a [frontend](https://github.com/cjk/smart-home-app) as well!

## Usage

### For development, start build-process and watcher with hot-reloading enabled:

```js
npm run dev
```

For production:

```js
npm run prod
```
But the above may not be enough depending on your environment - see below "Deploying and running manually"

## Prerequisites

You need a JSON-file containing your knx-addresses in `./src/config/group-address-list.js` in the following format:

``` javascript
import type { AddressList } from '../types';

// Rooms: KIT=Küche, WZ=Wohnzimmer, EZ=Esszimmer, TEC=Technik, HBY=Hobby, CEL-[1-3]=Cellar, OFFICE=Büro, KND-[1-3]=Kind, BATH=Bad, REST=Gäste-WC
// Types: switch, binary, fb (feedback-button), sensor, clock, ...
// Functions: light, scene, dim, outlet, lux, shut (~shutters), heat, inhibit (~ Sperre/Zwangsführung), time, date
//
// Optional attribute 'fbAddr' contains an knx-groupaddress that provides a feedback-value for current address ('Rückmeldeobjekt')
const addresses: AddressList = [
  {
    id: '0/0/1',
    name: 'Zentral aus',
    room: null,
    story: 'C',
    type: null,
    func: null,
  },
  {
    id: '1/1/0',
    name: 'Lock automatic light switching in cellar',
    room: 'hby',
    story: 'UG',
    type: 'switch',
    func: 'inhibit',
  },
  […]
```
Since such an address-list contains sensitive information, the default file used for my local KNX-configuration is encrypted into `./src/config/group-address-list.js.cast5`.

There’s a makefile task to encrypt and decrypt the KNX-address file. The needed password is taken from the environment-variable *SMARTHOME_ADDRESSLIST_SECRET*, so make sure you set this before using make to en-/decrypt your addresses.

### Deploying and running manually

Make sure KNXd is up and running

`npm install`
`npx run babel src --out-dir app`

`env DEBUG='smt:*,error' KNXD_ADDR='localhost' KNXD_PORT=6720 NODE_ENV=production node ./app/index.js`

Note you can adjust logging to include / exclude certain backend-modules:

`env DEBUG='smt:*,error,-smt:backend:cron' KNXD_ADDR='192.168.178.32' KNXD_PORT=6720 NODE_ENV=production node ./app/index.js`

### Deploying and running using pm2

Update `./ecosystem.config.js` to match your environment and run:

`pm2 deploy ecosystem.config.js production setup`

`pm2 deploy ecosystem.config.js production`

Made by [CjK](https://twitter.com/cjk)
