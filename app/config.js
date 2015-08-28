let config = {};

config.server = {
  port: process.env.PORT || 3005
};

config.monitor = {
  host: 'zircon',
  port: '6720'
};

module.exports = config;
