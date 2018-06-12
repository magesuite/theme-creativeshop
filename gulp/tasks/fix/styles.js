import map from 'map-stream';
import prettier from 'prettier';
import settings from '../../config/fix/styles';

const fix = (file, cb) => {
    file.contents = new Buffer(
        prettier.format(file.contents.toString(), settings.prettier)
    );
    cb(null, file);
};

module.exports = function() {
    return this.gulp
        .src(settings.src)
        .pipe(map(fix))
        .pipe(this.gulp.dest(settings.dest));
};
