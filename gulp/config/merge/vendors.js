import path from 'path';

import paths from '../../paths';

/**
 * Config for vendor JS files merging task.
 */
export default {
    watch: [
        path.join( paths.src, 'vendors/**/_*.js' ),
    ],
    src: [
        path.join( paths.src, 'vendors/**/_*.js' ),
    ],
    // Uglify settings.
    // @see https://www.npmjs.com/package/gulp-uglify#options
    uglify: {
    },
    dest: path.join( paths.dist, 'web/' ),
    filename: 'vendors.js',
};
