var gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cssMin = require('gulp-minify-css'),
    del = require('del'),
    webserver = require('gulp-webserver');

var paths = {
  scripts: 'app/scripts/**/*.js',
  styles: 'app/styles/**/*',
  html: 'app/html/**/*.jade',
  images: 'app/images/*',
  docs: 'app/documents/*'
};

gulp.task('clean', function() {
  return del(['build']);
});

gulp.task('scripts', ['clean'], function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('scripts/main.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', ['clean'], function() {
  return gulp.src(paths.styles)
    .pipe(stylus(
      {compress: true}
    ))
    .pipe(cssMin())
    .pipe(concat('styles/main.css'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('html', ['clean'], function() {
  return gulp.src(paths.html)
    .pipe(jade())
    .pipe(gulp.dest('dist/'));
});

gulp.task('images', ['clean'], function () {
  gulp.src(paths.images)
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('docs', function () {
  gulp.src(paths.docs)
    .pipe(gulp.dest('./dist/documents/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({livereload: true}));
});

gulp.task('default', ['webserver', 'watch', 'scripts', 'html', 'styles', 'images', 'docs']);
