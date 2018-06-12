import scss from 'postcss-scss';
import postcss from 'gulp-postcss';
import settings from '../../config/lint/styles';

module.exports = function() {
    return this.gulp
        .src(settings.src)
        .pipe(postcss(settings.processors, { syntax: scss }));
};
