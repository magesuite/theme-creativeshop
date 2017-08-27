import path from 'path';

// Get template info from composer.json file in current working directory.
const templateInfo = require(path.resolve('composer.json'));

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
  dist: path.resolve('../../../app/design/frontend/' + templateInfo.name),
  /**
     * Path to temporary directory relative to gulpfile.babel.js file.
     * @type {String}
     */
  tmp: '.tmp/',
};
