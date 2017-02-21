/* eslint-env node */
import browserSync from 'browser-sync';
import htmlmin from 'gulp-htmlmin';

import environment from '../../environment';
import settings from '../../config/copy/templates';
// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

/**
 * Copies templates from source to destination directory and minifies them if on production.
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
                'copy:templates',
                browserSync.reload,
            ]
        );
    }

    return this.gulp.src( settings.src )
        .pipe( htmlmin( settings.htmlmin ) )
        .pipe( this.gulp.dest( settings.dest ) );
};
