'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var peg = require('gulp-peg');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var ignore = require('gulp-ignore');
var debug = require('debug');
var exists = require('101/exists');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var packageJSON = require('./package.json');

/**
 * Common Directories.
 * @type {Object}
 */
var dir = {
  lib: "./lib/",
  js: './dist/js/'
};

/**
 * Browserfies a file stream.
 */
var browserified = transform(function(filename) {
  var b = browserify(filename);
  return b.bundle();
});

/**
 * Compiles all pegjs grammars in `grammar` and places the resulting
 * javascript into the `lib/` directory.
 */
gulp.task('peg', function() {
  var pegError = debug('notex:build:peg');
  return gulp.src('./grammar/*.pegjs')
    .pipe(peg().on('error', function(err) {
      pegError(err);
      process.exit(1);
    }))
    .pipe(rename({ basename: 'parser' }))
    .pipe(gulp.dest(dir.lib));
});

/**
 * Runs jshint on project source.
 */
gulp.task('lint', function() {
  var src = [
    dir.lib + '*.js',
    dir.lib + '*/*.js',
    '!'+dir.lib+'parser.js',
    './index.js'
  ]
  return gulp.src(src)
    .pipe(jshint(packageJSON.jshintConfig))
    .pipe(jshint.reporter(stylish));
});

/**
 * Compiles and packages the project source into the
 * `dist/js/` directory.
 */
gulp.task('js', ['peg'], function() {
  return gulp.src('./index.js')
    .pipe(browserified)
    .pipe(rename({ basename: 'notex' }))
    .pipe(gulp.dest(dir.js))
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(dir.js));
});

// gulp.task('css', function() {
//   return gulp.src('./css/mathed.css')
//     .pipe(gulp.dest('./dist/css/'))
//     .pipe(minifyCSS())
//     .pipe(rename({ extname: '.min.css' }))
//     .pipe(gulp.dest('./dist/css/'));
// });

// gulp.task('fonts', function() {
//   var sources = [
//     './fonts/*.eot',
//     './fonts/*.svg',
//     './fonts/*.ttf',
//     './fonts/*.woff'
//   ];
//   return gulp.src(sources).pipe(gulp.dest('./dist/fonts/'));
// });

/**
 * Master build task. Build the javascript, css, etc.
 * for the project and packages it into the `dist/`
 * directory.
 */
gulp.task('build', ['js']);