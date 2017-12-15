module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'SMARTHOME-BACKEND',
      script: './app/index.js',
      kill_timeout: 3000,
      env: {
        PORT: 8001,
        DEBUG: 'smt:*,error,debug',
      },
      env_production: {
        NODE_ENV: 'production',
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
        'yarn install && gulp build && pm2 reload ecosystem.config.js --env production',
    },
    dev: {
      // TODO
      user: 'cjk',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:cjk/smart-home-backend.git',
      path: '/home/cjk/apps/smarthome-backend',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env dev',
      env: {
        NODE_ENV: 'dev',
      },
    },
  },
};
