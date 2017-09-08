import tslint from 'gulp-tslint';
import settings from '../../config/lint/scripts';

module.exports = function() {
    return this.gulp
        .src(settings.src)
        .pipe(tslint(settings.tslint))
        .pipe(tslint.report(settings.tslintReport));
};
