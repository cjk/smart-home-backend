# Home-automation service written in Javascript.

- Written to automate and interact with a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based Bus-system.

- This service is meant to collect and interact with your smart-bus and send an information-stream of events to a frontend for visualization.

- Right now expects a [KNX](https://en.wikipedia.org/wiki/KNX_(standard))-based backend, but this can be changed pretty easily if your home runs on something else.

- Uses Websockets so you can exchange messages with the bus real fast and bi-directional.

- Built using modern functional reactive technologies, for clean, readable code and easy to understand program-flow.

Still in early development right now. Pull requests welcome of course.

## Usage

### For development, start build-process and watcher with hot-reloading enabled using gulp:

```js
gulp
```

…then start the server:

```js
npm start
```

For production, skip the gulp-task and simply run using

```js
env NODE_ENV='production' npm run start
```

Made by [CjK](https://twitter.com/cjk)
