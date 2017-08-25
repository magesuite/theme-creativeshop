import path from 'path';
import paths from '../../paths';

/**
 * Configuration for copying templates files.
 */
export default {
  watch: [path.join(paths.src, '**/*.html')],
  src: [path.join(paths.src, '**/*.html')],
  dest: paths.dist,
  htmlmin: {
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: true,
    quoteCharacter: "'",
    preventAttributesEscaping: true,
  },
};
