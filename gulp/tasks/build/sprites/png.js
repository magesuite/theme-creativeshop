/*eslint-env node */
import browserSync from 'browser-sync';

import gulpif from 'gulp-if';
import spritesmith from 'gulp.spritesmith';
import plumber from 'gulp-plumber';
import buffer from 'vinyl-buffer';
import imagemin from 'gulp-imagemin';

import environment from '../../../environment';
import settings from '../../../config/build/sprites/png';

/**
 * Variable used to fire gulp.watch only once.
 * @type {Boolean}
 */
let isWatching = false;

/**
 * Generates sprites from all of the png images from given path using spritesmith plugin.
 * @return {Promise} Gulp promise for proper task completition timing.
 */
module.exports = function() {
    /**
     * If we are in watch mode, add watchers for this task.
    */
    if ( environment.watch && !isWatching ) {
        isWatching = true;

        this.gulp.watch( [
            settings.watch,
        ], [ 'build:sprites:png', browserSync.reload ] );
    }

    const sprite = this.gulp.src( settings.src )
        .pipe( gulpif( environment.development, plumber() ) )
        .pipe( spritesmith( settings.spritesmith ) );

    sprite.img
        .pipe( buffer() )
        .pipe( gulpif( environment.production, imagemin( settings.imagemin ) ) )
        .pipe( this.gulp.dest( settings.imgDest ) );

    return sprite.css
        .pipe( this.gulp.dest( settings.cssDest ) );
};
