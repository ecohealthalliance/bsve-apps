var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssMin = require('gulp-minify-css');
var del = require('del');
var webserver = require('gulp-webserver');

var paths = {
  scripts: 'app/scripts/**/*.js',
  styles: 'app/styles/**/*',
  html: 'app/html/**/*.jade',
};

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('scripts', ['clean'], function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('scripts/main.js'))
    .pipe(gulp.dest(''));
});

gulp.task('styles', ['clean'], function() {
  return gulp.src(paths.styles)
    .pipe(stylus())
    .pipe(cssMin())
    .pipe(concat('styles/main.css'))
    .pipe(gulp.dest(''));
});

gulp.task('html', ['clean'], function() {
  return gulp.src(paths.html)
    .pipe(jade())
    .pipe(gulp.dest(''));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('webserver', function() {
  gulp.src('')
    .pipe(webserver({livereload: true}));
});

gulp.task('default', ['webserver', 'watch', 'scripts', 'html', 'styles']);
