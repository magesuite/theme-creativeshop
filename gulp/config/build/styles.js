import path from 'path';
import autoprefixer from 'autoprefixer';
import flexbugs from 'postcss-flexbugs-fixes';
import cleanCSS from 'postcss-clean';

import paths from '../../paths';
import environment from '../../environment';

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
    sass: {
        precision: 10,
        errLogToConsole: true,
    },
};

if ( environment.production ) {
    config.postcss.push( cleanCSS() );
}

export default config;
