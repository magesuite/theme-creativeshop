import path from 'path';

import paths from '../../paths';

/**
 * Returns configuration for copying assets that don't need any processing.
 */
export default {
    watch: [
        // Fonts.
        path.join(paths.src, '**/*.{ttf,woff,woff2,eot}'),
    ],

    src: [
        // Fonts.
        path.join(paths.src, '**/*.{ttf,woff,woff2,eot}'),
    ],
    dest: path.join(paths.dist, '/'),
};
