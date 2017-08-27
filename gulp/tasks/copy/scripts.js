import gulpIf from 'gulp-if';
import uglify from 'gulp-uglify';
import environment from '../../environment';
import settings from '../../config/copy/scripts';

let firstRun = true;

module.exports = function() {
  // If we are in watch mode, add watchers for this task.
  if (firstRun && environment.watch === true) {
    firstRun = false;
    this.gulp.watch([settings.watch], ['copy:scripts']);
  }

  return this.gulp
    .src(settings.src)
    .pipe(gulpIf(environment.production, uglify(settings.uglify)))
    .pipe(this.gulp.dest(settings.dest));
};
