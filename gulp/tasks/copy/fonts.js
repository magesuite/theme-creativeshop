import environment from '../../environment';
import settings from '../../config/copy/fonts';

// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

/**
 * Copies font files.
 * @return {Promise} Gulp promise for proper task completition timing.
 */
module.exports = function() {
  // If we are in watch mode, add watchers for this task.
  if (firstRun && environment.watch === true) {
    firstRun = false;
    this.gulp.watch([settings.watch], ['copy:fonts']);
  }

  return this.gulp.src(settings.src).pipe(this.gulp.dest(settings.dest));
};
