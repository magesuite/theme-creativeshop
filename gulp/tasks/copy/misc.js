/* eslint-env node */
import browserSync from 'browser-sync';

import environment from '../../environment';
import settings from '../../config/copy/misc';
// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

/**
 * Copies various assets from source to destination directory.
 * @return {Promise} Gulp promise for proper task completition timing.
 */
module.exports = function() {
    // Initiate watch only the first time.
    if ( firstRun && environment.watch === true ) {
        firstRun = false;
        this.gulp.watch(
            [
                settings.watch,
            ],
            [
                'copy:misc',
                browserSync.reload,
            ]
        );
    }

    return this.gulp.src( settings.src )
        .pipe( this.gulp.dest( settings.dest ) );
};
