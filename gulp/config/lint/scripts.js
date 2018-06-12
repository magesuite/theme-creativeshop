import path from 'path';
import paths from '../../paths';
import environment from '../../environment';

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
    tslint: {
        formatter: 'stylish',
    },
    tslintReport: {
        emitError: !environment.watch,
        summarizeFailureOutput: true,
        allowWarnings: true,
    },
};
