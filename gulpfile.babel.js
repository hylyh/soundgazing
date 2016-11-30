import gulp from 'gulp';
import connect from 'gulp-connect';
import util from 'gulp-util';
import path from 'path';
import cache from 'gulp-cached';
import eslint from 'gulp-eslint';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import jspm from 'gulp-jspm';
import htmlMin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import runSeq from 'run-sequence';
import del from 'del';

const paths = {
  dist: './dist',
  html: './src/*.html',
  img: './src/images/*',
  js: './src/**/*.js',
  src: './src',
  tracks: './src/tracks/**',
};

gulp.task('connect', () => {
  connect.server({
    root: paths.src,
    livereload: false,
  });
});

function logChanges(event) {
  util.log(
    util.colors.green(`File ${event.type}: `) +
    util.colors.magenta(path.basename(event.path))
  );
}

gulp.task('lintjs', () => gulp.src(paths.js)
  .pipe(cache('lintjs'))
  .pipe(eslint())
  .pipe(eslint.format()));

gulp.task('watch', () => {
  gulp.watch([paths.js], ['lintjs']).on('change', logChanges);
});

gulp.task('default', ['connect', 'watch']);

gulp.task('buildjs', () =>
  gulp.src('./src/main.js')
    .pipe(jspm({
      selfExecutingBundle: true,
      minify: true,
      skipSourceMaps: true,
    }))
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest(paths.dist)));

gulp.task('buildhtml', () =>
  gulp.src(paths.html)
    .pipe(replace('lib/system.js', 'app.min.js'))
    .pipe(replace('<script src="config.js"></script>', ''))
    .pipe(replace("<script>System.import('main');</script>", ''))
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.dist)));

gulp.task('buildimg', () =>
  gulp.src(paths.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
    }))
    .pipe(gulp.dest(path.join(paths.dist, 'images'))));

gulp.task('copy-tracks', () => {
  gulp.src(paths.tracks)
    .pipe(gulp.dest(path.join(paths.dist, 'tracks')));
});

gulp.task('clean', () =>
  del(path.join(paths.dist, '*')));

gulp.task('build', (done) => {
  runSeq('clean', ['buildimg', 'buildjs', 'buildhtml', 'copy-tracks'], done);
});
