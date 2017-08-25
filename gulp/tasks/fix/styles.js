import prettier from '@bdchauvette/gulp-prettier';
import settings from '../../config/fix/styles';

module.exports = function() {
  return this.gulp
    .src(settings.src)
    .pipe(prettier())
    .pipe(this.gulp.dest(settings.dest));
};
