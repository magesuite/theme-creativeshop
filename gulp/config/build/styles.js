import path from 'path';
import autoprefixer from 'autoprefixer';
import flexbugs from 'postcss-flexbugs-fixes';

import paths from '../../paths';

/**
 * Returns information for styles building.
 * @returns {object} Styles building task information.
 */
const config = {
    watch: [
        path.join( paths.src, '**/*.{css,scss,sass}' ),
    ],
    src: path.join( paths.src, '**/*.{css,scss,sass}' ),
    dest: path.join( paths.dist, 'web/' ),
    postcss: [
        flexbugs(),
        autoprefixer(
            {
                browsers: [
                    'IE>=10',
                    '>1%',
                    'last 2 versions',
                ],
            }
        ),
    ],
    cleancss: {
        level: 2,
    },
    sass: {
        precision: 10,
        errLogToConsole: true,
    },
};

export default config;
