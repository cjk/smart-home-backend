module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'smthome-backend',
      script: './app/index.js',
      kill_timeout: 5000,
      wait_ready: true,
      env: {
        PORT: 8001,
        KNXD_ADDR: '192.168.178.28',
        KNXD_PORT: 6720,
        DEBUG: 'smt:*,error,debug',
      },
      env_production: {
        NODE_ENV: 'production',
        KNXD_ADDR: 'localhost',
        KNXD_PORT: 6720,
        DEBUG: 'smt:*,error',
      },
    },
  ],

  watch: ['app'],
  ignore_watch: ['node_modules', 'src'],
  watch_options: {
    followSymlinks: false,
  },

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'cjk',
      host: '192.168.178.28',
      ref: 'origin/master',
      repo: 'git@github.com:cjk/smart-home-backend.git',
      path: '/home/cjk/apps/smarthome-backend',
      'pre-deploy': 'rm -Rf app/*',
      'post-deploy':
        'npm install && source /etc/profile.d/smarthome-backend-auth.sh && make decrypt_conf && npx babel src --out-dir app && pm2 reload ecosystem.config.js --env production',
    },
  },
}
