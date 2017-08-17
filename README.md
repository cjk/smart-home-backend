# Home-automation service backend written in Javascript.

- Written to automate and interact with a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based Bus-system. Other bus-components / standards may follow.

- This service is meant to collect and interact with your KNX home installation and send an information-stream of events to a [frontend](https://github.com/cjk/smart-home-app) for visualization.

- Right now expects a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based backend, but this can be changed pretty easily if your home runs on something else.

- Uses Websockets to communicate with a realtime datastore (deepstream.io) so you can exchange messages with the bus real fast and bi-directional.

- Built using modern functional reactive technologies, for clean, readable code and easy to understand program-flow.

This is a NodeJS CLI application, in order to visualize what is going on on your home-bus and to send commands, you need a [frontend](https://github.com/cjk/smart-home-app) as well!

## Usage

### For development, start build-process and watcher with hot-reloading enabled using gulp:

```js
gulp
```

…then start the server:

```js
yarn run dev
```

For production:

```js
yarn run prod
```

Made by [CjK](https://twitter.com/cjk)
