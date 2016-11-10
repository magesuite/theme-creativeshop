import path from 'path';

import paths from '../../paths';

/**
 * Cleaning task settings.
 */
export default {
    /**
     * Paths that should be deleted.
     */
    src: [
        path.join( paths.dist, '**/*' ),
        path.join( paths.tmp, '**/*' ),
    ],
};
