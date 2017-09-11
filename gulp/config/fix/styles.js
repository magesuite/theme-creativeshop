import path from 'path';

import paths from '../../paths';

/**
 * Settings for SASS linting task.
 */
const settings = {
    src: [
        /**
         * Lint everything inside components and layouts directories.
         */
        path.join(paths.src, '**/*.{css,scss,sass}'),
        '!' + path.join(paths.src, 'vendors/**/*.{css,scss,sass}'),
        '!' + path.join(paths.src, 'utilities/_sprites.scss'),
    ],
    dest: paths.src,
};

export default settings;
