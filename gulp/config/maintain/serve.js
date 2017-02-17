/* eslint-env node */

/**
 * Settings for serve task.
 */
const settings = {
    /**
     * BrowserSync configuration.
     */
    browserSync: {
        proxy: {
            target: 'http://m2c.dev',
        },
    },
};

export default settings;
