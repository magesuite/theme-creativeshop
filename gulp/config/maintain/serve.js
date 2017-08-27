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
      target: 'http://m2c.dev',
    },
    files: [`${paths.dist}/**/*`],
  },
};

export default settings;
