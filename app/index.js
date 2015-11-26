require('babel-register');

function enablePiping(env) {
  if (env !== 'production') {
    if (!require('piping')({hook: true})) {
      return;
    }
  }
  require('./main');
}
enablePiping(process.env.NODE_ENV);
