var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('html', ['styles', 'fonts'], function () {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe().pipe($.csso);

  gulp.src(['.tmp/fonts/**/*'])
    .pipe(gulp.dest('dist/fonts'));

  return gulp.src(['app/**/*.html'])
    .pipe($.useref({ searchPath: ['.tmp' ,'app', '.'] }))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    //.pipe($.if('*.html', $.htmlmin()))
    .pipe(gulp.dest('dist'));
});
