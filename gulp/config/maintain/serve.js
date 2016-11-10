/* eslint-env node */
/* eslint-disable global-require, no-sync, no-empty */

import path from 'path';
import util from 'gulp-util';

/**
 * Settings for serve task.
 */
const settings = {
    /**
     * BrowserSync configuration.
     */
    browserSync: {
        notify: false,
        port: 9000,
        server: {
            baseDir: [ 'dist' ],
            directory: true,
        },
    },
};

let browserSync = null;
try {
    browserSync = require( path.resolve( 'browserSync.json' ) );
} catch ( e ) {
    util.log( 'No browserSync.json file found in project root, loading default config.' );
}

if ( browserSync ) {
    settings.browserSync = browserSync;
}

export default settings;
