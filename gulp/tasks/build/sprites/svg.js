/*eslint-env node */

import browserSync from 'browser-sync';
import notifier from 'node-notifier';
import svgSprite from 'gulp-svg-sprite';
import util from 'gulp-util';

import environment from '../../../environment';
import settings from '../../../config/build/sprites/svg';
// Indicate if we are running the task the first time in watch mode.
let firstRun = true;

module.exports = function() {
    // Initiate watch only the first time.
    if ( firstRun && environment.watch === true ) {
        firstRun = false;
        this.gulp.watch(
            [
                settings.watch,
            ],
            [
                'build:sprites:svg',
                browserSync.reload,
            ]
        );
    }

    return this.gulp.src( settings.src )
        .pipe( svgSprite( settings.svgSprite ) )
        .on( 'error', function( error ) {
            notifier.notify( {
                'title': 'SVG Sprites Error',
                'message': error.message,
            } );
            if ( environment.watch ) {
                util.log( error.message );
                this.emit( 'end' );
            } else {
                throw error;
            }
        } )
        .pipe( this.gulp.dest( settings.dest ) );
};

