import path from 'path';

import paths from '../../paths';

/**
 * Returns configuration for copying miscellaneous files that don't need any processing.
 */
export default {
  watch: [
    // Preview images.
    path.join(paths.src, '*.{png,jpg,jpeg}'),
    // JSON except data for templates.
    path.join(paths.src, '**/*.json'),
    // PHP files
    path.join(paths.src, '**/*.{php,phtml}'),
    // XML files
    path.join(paths.src, '**/*.xml'),
    // CSV files
    path.join(paths.src, '**/*.csv'),
    // Require.js configs.
    path.join(paths.src, '**/requirejs-config.js'),
    // Less styles.
    path.join(paths.src, '**/*.less'),
    //Theme web images
    path.join(paths.src, '**/*.{gif,png,jpg,webp,svg,ico}'),
  ],

  src: [
    // Preview images.
    path.join(paths.src, '*.{png,jpg,jpeg}'),
    // JSON.
    path.join(paths.src, '**/*.json'),
    // PHP files
    path.join(paths.src, '**/*.{php,phtml}'),
    // XML files
    path.join(paths.src, '**/*.xml'),
    // CSV files
    path.join(paths.src, '**/*.csv'),
    // Require.js configs.
    path.join(paths.src, '**/requirejs-config.js'),
    // Less styles.
    path.join(paths.src, '**/*.less'),
    //Theme web images
    path.join(paths.src, '**/*.{gif,png,jpg,webp,svg,ico}'),
  ],
  dest: paths.dist,
};
