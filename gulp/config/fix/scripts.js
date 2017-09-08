import path from 'path';

import paths from '../../paths';

/**
 * Settingf for TypeScript linting task.
 * @type {Object}
 */
export default {
    src: [
        /**
         * Lint all TypeScript files.
         */
        path.join(paths.src, '**/*.ts'),
        '!' + path.join(paths.src, 'vendors/**/*.ts'),
    ],
    dest: paths.src,
};
