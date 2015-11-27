import config from '../config';

import knxdSrc from './knxdSource';
import mockSrc from './mockSource';

const opts = {host: config.knxd.host, port: config.knxd.port};

const knxListener  = config.knxd.isAvailable ? knxdSrc(opts) : mockSrc(opts);

export default knxListener;
