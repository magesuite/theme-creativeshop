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
                    'ie >= 9',
                    'ie_mob >= 10',
                    'ff >= 30',
                    'chrome >= 34',
                    'safari >= 7',
                    'opera >= 23',
                    'ios >= 7',
                    'android >= 4.2',
                    'bb >= 10',
                ],
            }
        ),
    ],
    cleancss: {},
    sass: {
        precision: 10,
        errLogToConsole: true,
    },
};

export default config;
