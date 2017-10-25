/* @flow */

import logger from 'debug';
import type { ServerState } from '../types';
import busServer from './busServer';

const debug = logger('smt:server');

function publish(props: ServerState) {
  busServer(props);
  debug('==> Server started');
}

export default publish;
