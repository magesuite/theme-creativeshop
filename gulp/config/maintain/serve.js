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
            target: 'http://creativeshop.me'
        },
        rewriteRules: [
            {
                match: '.creativeshop.me',
                replace: ''
            }
        ],
        files: [`${paths.dist}/**/*`],
        serveStatic: [
            {
                route: `${paths.distWeb}/en_US`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/en_GB`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/de_DE`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/en_DE`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/de_AT`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/en_AT`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/de_CH`,
                dir: `${paths.dist}/web`
            },
            {
                route: `${paths.distWeb}/en_CH`,
                dir: `${paths.dist}/web`
            }
        ]
    },
};

export default settings;