import path from 'path';

import paths from '../../paths';

/**
 * Settings for TypeScript linting task.
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
    prettier: {
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
        tabWidth: 4,
    },
    dest: paths.src,
};
