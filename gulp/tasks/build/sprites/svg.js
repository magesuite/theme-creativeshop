import svgSprite from 'gulp-svg-sprite';
import util from 'gulp-util';

import environment from '../../../environment';
import settings from '../../../config/build/sprites/svg';
// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

module.exports = function() {
  // Initiate watch only the first time.
  if (firstRun && environment.watch === true) {
    firstRun = false;
    this.gulp.watch([settings.watch], ['build:sprites:svg']);
  }

  return this.gulp
    .src(settings.src)
    .pipe(svgSprite(settings.svgSprite))
    .on('error', error => {
      if (!environment.watch) {
        throw error;
      }

      util.log(error.message);
      this.emit('end');
    })
    .pipe(this.gulp.dest(settings.dest));
};
