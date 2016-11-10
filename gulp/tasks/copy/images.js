/* eslint-env node */
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';

import environment from '../../environment';
import settings from '../../config/copy/images';
// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

/**
 * Copies images from source to destination directory and minifies them for production.
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
                'copy:images',
                browserSync.reload,
            ]
        );
    }

    return this.gulp.src( settings.src )
        .pipe( gulpif( environment.production, imagemin( settings.imagemin ) ) )
        .pipe( this.gulp.dest( settings.dest ) );
};
