import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import gulpIf from 'gulp-if';
import cleanCSS from 'gulp-clean-css';
import environment from '../../environment';
import settings from '../../config/build/styles';

let firstRun = true;

module.exports = function() {
    // Initiate watch only the first time.
    if (firstRun && environment.watch === true) {
        firstRun = false;
        this.gulp.watch([settings.watch], ['build:styles']);
    }

    return this.gulp
        .src(settings.src)
        .pipe(gulpIf(!environment.production, sourcemaps.init()))
        .pipe(
            sass(settings.sass)
                .on('error', sass.logError)
                .on('error', error => {
                    // Throw error only when not during watch mode.
                    if (!environment.watch) {
                        throw error;
                    }
                })
        )
        .pipe(postcss(settings.postcss))
        .pipe(gulpIf(environment.production, cleanCSS(settings.cleanCSS)))
        .pipe(gulpIf(!environment.production, sourcemaps.write()))
        .pipe(this.gulp.dest(settings.dest));
};
