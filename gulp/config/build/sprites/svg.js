import path from 'path';

import paths from '../../../paths';

/**
 * Settings for SVG sprites.
 */
export default {
    watch: [
        path.join( paths.src, 'sprites/svg/*.svg' ),
    ],
    src: path.join( paths.src, 'sprites/svg/*.svg' ),
    dest: path.join( paths.dist, 'web/images/' ),
    /**
     * Gulp-svg-sprite configuration.
     * @see https://github.com/jkphl/gulp-svg-sprite#api
     */
    svgSprite: {
        mode: {
            css: false,
            view: false,
            defs: false,
            symbol: {
                dest: '',
                sprite: 'sprites.svg',
            },
            stack: false,
        },
    },
};
