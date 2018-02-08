import reporter from 'postcss-reporter';
import stylelint from 'stylelint';
import path from 'path';

import environment from '../../environment';
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
    processors: [
        stylelint({ syntax: 'scss' }),
        reporter({
            clearMessages: true,
            throwError: !environment.watch,
        }),
    ],
};

export default settings;
