require('babel/register')({optional: ['es7']});

function enablePiping(env) {
  if (env !== 'production') {
    if (!require('piping')({hook: true})) {
      return;
    }
  }
  require('./server');
}

enablePiping(process.env.NODE_ENV);
