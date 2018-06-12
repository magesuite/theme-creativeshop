import path from 'path';

import paths from '../../paths';

/**
 *  Configuration for images task.
 */
export default {
    watch: [
        // Images except sprites
        path.join(paths.src, 'images/**/*.{gif,png,jpg,webp,svg,ico}'),
    ],
    src: [
        // Images except sprites
        path.join(paths.src, 'images/**/*.{gif,png,jpg,webp,svg,ico}'),
    ],
    dest: path.join(paths.dist, 'web/images/'),
    /**
     * Configuration for imagemin image minifier.
     * @see https://github.com/sindresorhus/gulp-imagemin#imageminoptions
     */
    imagemin: {},
};
