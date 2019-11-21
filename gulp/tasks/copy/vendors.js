import environment from '../../environment';
import settings from '../../config/copy/vendors';

let firstRun = true;

module.exports = function() {
    // If we are in watch mode, add watchers for this task.
    if (firstRun && environment.watch === true) {
        firstRun = false;
        this.gulp.watch([settings.watch], ['copy:vendors']);
    }

    return this.gulp
        .src(settings.src)
        .pipe(this.gulp.dest(settings.dest));
};
