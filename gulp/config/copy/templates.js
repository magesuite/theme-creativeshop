import path from 'path';

import paths from '../../paths';

/**
 * Returns configuration for copying templates files.
 */
export default {
    watch: [
        // PHP and HTML templates.
        path.join( paths.src, '**/*.html' ),
    ],
    src: [
        // PHP and HTML templates.
        path.join( paths.src, '**/*.html' ),
    ],
    dest: paths.dist,
    htmlmin: {
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: true,
        minifyJS: true,
        quoteCharacter: '\'',
        preventAttributesEscaping: true,
    },
};
