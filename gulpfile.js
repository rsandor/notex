var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var peg = require('gulp-peg');
var debug = require('debug');
var exists = require('101/exists');

var error = debug('notex:build:error');


var browserified = transform(function(filename) {
  var b = browserify(filename);
  return b.bundle();
});

var dir = {
  lib: "./lib/",
  js: './dist/js/'
};

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

gulp.task('js', function() {
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

gulp.task('build', ['peg', 'js']);