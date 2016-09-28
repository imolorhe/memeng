let gulp = require('gulp');
let sass = require('gulp-sass');
let uglify = require('gulp-uglify');


gulp.task('sass', () => {
    return gulp.src('scss/styles.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css'))
        .pipe(notify({message: 'SCSS compiled!'}));
});