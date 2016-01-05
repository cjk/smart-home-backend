import config from '../config';

import knxdSrc from './knxdSource';
import mockSrc from './mockSource';

const {host, port} = config.knxd;
const opts = {host, port};

const knxListener = config.knxd.isAvailable ? knxdSrc(opts) : mockSrc(opts);

export default knxListener;
