var gulp = require('gulp');
var jshint = require('gulp-jshint');
var del = require('del');
var runSequence = require('run-sequence');
var babel = require('gulp-babel');
var assign = Object.assign || require('object.assign');

var paths = {
  root: 'src',
  source: 'src/**/*.js',
  html:   'src/**/*.html',
  style: 'styles/**/*.css',
  sass: 'scss/**/*.scss',
  output: 'dist/',
  doc:'./doc'
};

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceRoot: '',
  moduleRoot: 'symphony',
  moduleIds: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    }
  }
};

gulp.task('clean', function(cb) {
  del([paths.output], cb);
});

gulp.task('lint', function() {
  return gulp.src(paths.source)
    .pipe(jshint());
});

gulp.task('build-es6', function () {
  return gulp.src(paths.source)
    .pipe(gulp.dest(paths.output + 'es6'));
});

gulp.task('build-commonjs', function () {
  return gulp.src(paths.source)
    .pipe(babel(assign({}, compilerOptions, {modules:'common'})))
    .pipe(gulp.dest(paths.output + 'commonjs'));
});

gulp.task('build-amd', function () {
  return gulp.src(paths.source)
    .pipe(babel(assign({}, compilerOptions, {modules:'amd'})))
    .pipe(gulp.dest(paths.output + 'amd'));
});

gulp.task('build-system', function () {
  return gulp.src(paths.source)
    .pipe(babel(assign({}, compilerOptions, {modules:'system'})))
    .pipe(gulp.dest(paths.output + 'system'));
});

gulp.task('build-ignore', function () {
  return gulp.src(paths.source)
    .pipe(babel(assign({}, compilerOptions, {modules:'ignore'})))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
	'build-ignore',
    callback
  );
});

gulp.task('default', ['clean', 'lint', 'build']);