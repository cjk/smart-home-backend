/* @flow */
/* eslint no-console: "off" */
import type { ServerProps } from '../types';
import busServer from './busServer';

function publish(props: ServerProps) {
  busServer(props);
  console.info('==> ✅ Server started');
}

export default publish;
