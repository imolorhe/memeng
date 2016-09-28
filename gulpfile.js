let path = require('path');

let gulp = require('gulp');
let sass = require('gulp-sass');
let uglify = require('gulp-uglify');
let notify = require('gulp-notify');

function notifyMe(msg) {
	let opts = {
		title: 'MemeNG',
		subtitle: 'Meme generator',
		message: msg.message || msg,
		sound: 'Frog',
		icon: path.join(__dirname, 'public/img/memeng_logo.png')
	};

	return notify(opts);
};

gulp.task('sass', () => {
	return gulp.src('scss/styles.scss')
		.pipe(sass()).on('error', sass.logError)
		.pipe(gulp.dest('public/css'))
		.pipe(notifyMe({message: 'SCSS compiled!'}));
});

gulp.task('watch', () => {
	gulp.watch('scss/**/*.scss', ['sass']);
});
