// @flow
import type { KnxdOpts } from '../types';

import config from '../config';

import knxdSrc from './knxdSource';
import mockSrc from './mockSource';

const { host, port, isAvailable } = config.knxd;
const opts: KnxdOpts = { host, port, isAvailable };

const knxListener = isAvailable ? knxdSrc(opts) : mockSrc(opts);

export default knxListener;
