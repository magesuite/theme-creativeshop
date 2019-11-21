import path from 'path';
import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import util from 'gulp-util';

import environment from '../../environment';
import paths from '../../paths';
// Variable storing bundle cache for faster compilation in watch mode.
let cache;

/**
 * Returns information for scripts building.
 */
const settings = {
    /**
     * Paths to watch for this task.
     */
    watch: [path.join(paths.src, '**/*.ts')],
    /**
     * Rollup configuration.
     * @see https://github.com/rollup/rollup/wiki/JavaScript-API#bundlegenerate-options-
     */
    rollup: {
        entry: path.join(paths.src, 'bundle.ts'),
        cache: cache,
        plugins: [
            /**
             * Rollup typescript plugin configuration.
             * @see https://github.com/rollup/rollup-plugin-typescript
             */
            typescript({
                include: '../../**/*.ts',
            }),
            commonjs(),
            globals(),
        ],
        onwarn: message => {
            // Log rollup messages only if "--verbose" flag was used.
            if (util.env.verbose) {
                util.log(message);
            }
        },
    },
    rollupBundle: {
        /**
         * JavaScript bundle destination directory.
         */
        dest: path.join(paths.dist, 'web/bundle.js'),
        format: 'umd',
        moduleName: 'bundle',
        amd: {
            id: 'bundle',
        },
        globals: {
            jQuery: 'jQuery',
            $: 'jQuery',
        },
        sourceMap: !environment.production,
    },
};

export default settings;
