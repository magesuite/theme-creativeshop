import path from 'path';

import paths from '../../../paths';

/**
 * Settings for PNG sprites task.
 * @type {Object}
 */
export default {
    watch: [
        path.join( paths.src, 'sprites/png/*.png' ),
    ],
    /**
     * Path to source files.
     */
    src: path.join( paths.src, 'sprites/png/*.png' ),
    /**
     * Target directory for normal and retina sprites.
     */
    imgDest: path.join( paths.dist, 'web/images/' ),
    /**
     * Target directory for SASS file.
     */
    cssDest: path.join( paths.src, 'utilities/' ),
    /**
     * Gulp.spritesmith settings.
     * @see https://github.com/twolfson/gulp.spritesmith#documentation
     */
    spritesmith: {
        retinaSrcFilter: path.join( paths.src, 'sprites/png/*@2x.png' ),
        imgName: 'sprites.png',
        imgPath: '/images/sprites.png',
        retinaImgName: 'sprites2x.png',
        retinaImgPath: '/images/sprites2x.png',
        cssName: '_sprites.scss',
        padding: 2,

        cssVarMap: function( sprite ) {
            sprite.name = 'sprite-' + sprite.name;
        },
    },
};
