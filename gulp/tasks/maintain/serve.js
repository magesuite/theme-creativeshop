import browserSync from 'browser-sync';
import settings from '../../config/maintain/serve';

module.exports = function() {
    browserSync.init(settings.browserSync);
};
