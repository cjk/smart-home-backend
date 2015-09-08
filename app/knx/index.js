import config from '../config';

import listener from './listener';

const opts = {host: config.monitor.host, port: config.monitor.port},
      knxListender = listener(opts);

export default {
  knxListender,
};
