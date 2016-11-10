/*eslint-env node */
import browserSync from 'browser-sync';
import settings from '../../config/maintain/serve';

/**
 * Serves project files using provided BrowserSync config.
 * @return {void} Nothing is returned.
 */
module.exports = function() {
    /*eslint no-sync: 0*/
    browserSync.init( settings.browserSync );
};
