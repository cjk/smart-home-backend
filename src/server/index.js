/* @flow */

import logger from 'debug';
import type { ServerProps } from '../types';
import busServer from './busServer';

const debug = logger('smt-server');

function publish(props: ServerProps) {
  busServer(props);
  debug('==> Server started');
}

export default publish;
