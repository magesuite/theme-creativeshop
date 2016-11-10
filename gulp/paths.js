/* eslint-env node */
import path from 'path';

const templateInfo = require( '../src/composer.json' );

/**
 * Default paths for a project.
 */
export default {
    /**
     * Path to sources directory relative to gulpfile.babel.js file.
     * @type {String}
     */
    src: 'src/',
    /**
     * Path to distribution directory relative to gulpfile.babel.js file.
     * @type {String}
     */
    dist: path.resolve( '../../../app/design/frontend/' + templateInfo.name ),
    /**
     * Path to temporary directory relative to gulpfile.babel.js file.
     * @type {String}
     */
    tmp: '.tmp/',
};
