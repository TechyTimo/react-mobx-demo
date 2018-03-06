'use strict'

var gulp = require('gulp');

var uncss = require('gulp-uncss');

// gulp.task('default');
gulp.task('default', function () {
    return gulp.src('./public/css/style.css')
        .pipe(uncss({
            html: [
            './generated/login.html', 
            './generated/register.html', 
            './generated/forgot-password.html', 
            './generated/profile.html',
            './generated/friends.html',
            './generated/404.html',
            ]
        }))
        .pipe(gulp.dest('./public'));
});
