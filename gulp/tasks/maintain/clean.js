/*eslint-env node */
import del from 'del';

import settings from '../../config/maintain/clean';

/**
 * Task used for deleting old files in order to have a clean build.
 * @return {Promise} Gulp promise for proper task completition timing.
 */
module.exports = function() {
    return del(
        settings.src,
        {
            force: true
        }
     );
};
