import path from 'path';
import paths from '../../paths';

/**
 * Configuration for vendor JS files merging task.
 */
export default {
    watch: [path.join(paths.src, 'vendors/**/_*.js')],
    src: [path.join(paths.src, 'vendors/**/_*.js')],
    dest: path.join(paths.dist, 'web/'),
    filename: 'vendors.js',
};
