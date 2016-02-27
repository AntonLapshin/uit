var gulp = require('gulp');
var cache = require('gulp-cached');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

gulp.task('build-js', function() {
  return gulp.src('src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Javascript file has been minified' })); 
});

gulp.task('less', function () {
  gulp.src('examples/**/*.less')
    .pipe(cache('less'))
    .pipe(less())
    .pipe(gulp.dest('examples'));
});

gulp.task('watch-less', function() {
  gulp.watch('examples/**/*.less', ['less']);
});