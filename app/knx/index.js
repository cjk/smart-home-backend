import config from '../config';

import listener from './listener';

const opts = {host: config.knxd.host, port: config.knxd.port},
      knxListender = listener(opts);

export default {
  knxListender,
};
