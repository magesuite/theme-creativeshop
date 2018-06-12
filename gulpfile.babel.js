import gulp from 'gulp';
import path from 'path';
import loadTasks from 'gulp-task-loader';
import sequence from 'run-sequence';
import environment from './gulp/environment';

/**
 * Load tasks only if CreativeShop is being built directly, not as a npm module.
 */
if (process.cwd() === __dirname) {
    loadTasks(path.join('gulp', 'tasks'));
}

/**
 *  Task for building entire project.
 */
gulp.task('build', done => {
    sequence(
        'maintain:clean',
        [
            'build:sprites:svg',
            'build:scripts',
            'build:styles',

            'copy:templates',
            'copy:fonts',
            'copy:images',
            'copy:misc',
            'copy:twig',
            'copy:vendors',
            'copy:scripts',

            'merge:vendors',
        ],
        done
    );
});

/**
 *  Task for project linting.
 */
gulp.task('fix', done => {
    sequence(['fix:scripts', 'fix:styles'], done);
});

/**
 *  Task for project linting.
 */
gulp.task('lint', ['fix'], done => {
    sequence(['lint:scripts', 'lint:styles'], done);
});

/**
 *  Task for watching project files.
 */
gulp.task('watch', done => {
    environment.watch = true;
    sequence('build', done);
});

/**
 *  Task for serving project files.
 */
gulp.task('serve', done => {
    sequence('watch', 'maintain:serve', done);
});

/**
 *  Task that fires project linting on every commit attempt.
 */
gulp.task('pre-push', done => {
    sequence('lint', done);
});

/**
 *  Default task
 */
gulp.task('default', ['build']);
