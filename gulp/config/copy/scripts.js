import path from 'path';

import paths from '../../paths';

/**
 * Returns configuration for copying script files that don't need any processing.
 */
export default {
    watch: [
        path.join( paths.src, '**/*.js' ),
        '!' + path.join( paths.src, 'vendors/**/*.js' ),
    ],
    src: [
        path.join( paths.src, '**/*.js' ),
        '!' + path.join( paths.src, 'vendors/**/*.js' ),
    ],
    // Uglify settings.
    // @see https://www.npmjs.com/package/gulp-uglify#options
    uglify: {
    },
    dest: paths.dist,
};
