module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'smthome-backend',
      script: './app/index.js',
      kill_timeout: 3000,
      env: {
        PORT: 8001,
        KNXD_ADDR: '192.168.1.28',
        KNXD_PORT: 6720,
        DEEPSTREAM_ADDR: 'localhost',
        DEEPSTREAM_PORT: 6020,
        DEBUG: 'smt:*,error,debug',
      },
      env_production: {
        NODE_ENV: 'production',
        KNXD_ADDR: 'localhost',
        KNXD_PORT: 6720,
        DEEPSTREAM_ADDR: 'localhost',
        DEEPSTREAM_PORT: 6020,
        DEBUG: 'smt:*,error',
      },
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'cjk',
      host: '192.168.1.28',
      ref: 'origin/master',
      repo: 'git@github.com:cjk/smart-home-backend.git',
      path: '/home/cjk/apps/smarthome-backend',
      'post-deploy':
        'yarn install && source /etc/profile.d/smarthome-backend-auth.sh && make decrypt_conf && gulp build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
