import config from '../config';

import knxdSrc from './knxdSource';
import mockSrc from './mockSource';

const opts = {host: config.knxd.host, port: config.knxd.port},
      /*       knxListener = knxdSrc(opts); */
      knxListener = mockSrc(opts);

export default knxListener;
