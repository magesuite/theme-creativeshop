import paths from '../../paths';

/**
 * Settings for serve task.
 */
const settings = {
    /**
     * BrowserSync configuration.
     */
    browserSync: {
        proxy: {
            target: 'http://creativeshop.me',
        },
        files: [`${paths.dist}/**/*`],
    },
};

export default settings;
