import gulp from 'gulp';
import babel from 'gulp-babel';
import changed from 'gulp-changed';
import preprocess from 'gulp-preprocess';
import sourcemaps from 'gulp-sourcemaps';
import watch from 'gulp-watch';
import del from 'del';

const SRC = './src/**/*.js';
const DEST = 'app';

function build() {
  gulp.src([SRC])
      .pipe(changed(DEST))
      .pipe(sourcemaps.init())
      .pipe(preprocess())
      .pipe(babel({
        presets: ['latest'],
        plugins: ['transform-flow-strip-types'],
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(DEST));
}

gulp.task('clean', () =>
  del([
    DEST,
  ])
);

gulp.task('build', build);

gulp.task('hotupdate', () =>
  watch(SRC, build, {ignoreInitial: false})
);

gulp.task('default', ['build', 'hotupdate']);
