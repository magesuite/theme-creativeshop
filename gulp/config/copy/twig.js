import path from 'path';
import paths from '../../paths';

/**
 * Configuration for copying assets that don't need any processing.
 */
export default {
    watch: [path.join(paths.src, '**/*.twig')],

    componentsPath: path.resolve(
        'node_modules/creative-patterns/packages/components'
    ),
    src: path.join(paths.src, '**/*.twig'),
    dest: paths.dist,
};
