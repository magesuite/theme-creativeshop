import path from 'path';

// Get template info from composer.json file in current working directory.
const templateInfo = require(path.resolve('composer.json'));

/**
 * Default paths for a project.
 */
export default {
    /**
     * Path to sources directory relative to CWD.
     * @type {String}
     */
    src: path.resolve('src/'),
    /**
     * Path to distribution directory relative to CWD.
     * @type {String}
     */
    dist: path.resolve('../../../app/design/frontend/' + templateInfo.name),
    /**
     * Path to temporary directory relative to CWD.
     * @type {String}
     */
    tmp: '.tmp/',
    /**
     * Web (url) path to theme's frontend assets (without the language part)
     * @type {String}
     */
    distWeb: `/static/frontend/${templateInfo.name.charAt(0).toUpperCase()}${templateInfo.name.slice(1)}`
};