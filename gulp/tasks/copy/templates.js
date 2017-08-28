import environment from '../../environment';
import settings from '../../config/copy/templates';

let firstRun = true;

module.exports = function() {
  // Initiate watch only the first time.
  if (firstRun && environment.watch === true) {
    firstRun = false;
    this.gulp.watch([settings.watch], ['copy:templates']);
  }

  return this.gulp.src(settings.src).pipe(this.gulp.dest(settings.dest));
};
