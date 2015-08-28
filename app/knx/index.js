import config from '../config';

import listener from './listener';
import handler from './handler';

const opts = {host: config.monitor.host, port: config.monitor.port},
      knxListender = listener(opts);

export default {
  knxListender,
  handler
};
