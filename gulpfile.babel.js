import gulp from 'gulp';
import gutil from 'gulp-util';
import nodemon from 'gulp-nodemon';

function serverWatch() {
  gutil.log('-> Watching Server...');

  nodemon({
    script: 'app/index.js',
    ext: 'js jsx',
    ignore: ['gulpfile.babel.js', 'dist/*', 'node_modules/*'],
    watch: ['app/*']
  });
}

gulp.task('serverwatch', serverWatch);

gulp.task('default', ['serverwatch']);
