import prettier from '@bdchauvette/gulp-prettier';
import settings from '../../config/fix/scripts';

module.exports = function() {
    return this.gulp
        .src(settings.src)
        .pipe(prettier(settings.prettier))
        .pipe(this.gulp.dest(settings.dest));
};
