import path from 'path';

import environment from '../../environment';
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
        path.join( paths.src, '**/*.ts' ),
        '!' + path.join( paths.src, 'vendors/**/*.ts' ),
    ],
    tslint: {
        formatter: 'verbose',
    },
    tslintReport: {
        emitError: !environment.watch,
        summarizeFailureOutput: true,
    },
};
