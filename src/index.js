// @flow

// Load some environment-variables from local files - see ~/.env*
require('dotenv').config();

function enablePiping(env) {
  if (env !== 'production') {
    if (!require('piping')({ hook: true })) {
      return;
    }
  }
  require('./main');
}
enablePiping(process.env.NODE_ENV);
