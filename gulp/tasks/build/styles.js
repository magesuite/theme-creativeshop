/* eslint-env node */
import sourcemaps from 'gulp-sourcemaps';
import notifier from 'node-notifier';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import browserSync from 'browser-sync';
import gulpif from 'gulp-if';
import cleanCSS from 'gulp-clean-css';

import environment from '../../environment';
import settings from '../../config/build/styles';

// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

/**
 * Compiles styles with SASS.
 * This function does following things:
 * - Generate sourcemaps,
 * - Compile with SASS,
 * - Autroprefix,
 * - Minify with cleanCSS.
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
                'build:styles',
                browserSync.reload,
            ]
        );
    }

    return this.gulp.src( settings.src )
        .pipe( sourcemaps.init() )
        .pipe( sass( settings.sass )
            .on( 'error', sass.logError )
            .on( 'error', ( error ) => {
                notifier.notify( {
                    'title': 'Styles Comilation Error',
                    'message': error.message,
                } );
                // Throw error only when not during watch mode.
                if ( !environment.watch ) {
                    throw error;
                }
            } )
        )
        .pipe( postcss( settings.postcss ) )
        .pipe( gulpif( environment.production, cleanCSS( settings.cleancss ) ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( this.gulp.dest( settings.dest ) );
};
