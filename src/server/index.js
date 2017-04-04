/* @flow */
/* eslint no-console: "off" */
import type { ServerProps } from '../types';
import busServer from './busServer';

function server(props: ServerProps) {
  busServer(props);
  console.info('==> ✅ Server started');
}

export default server;
