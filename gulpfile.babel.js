/**
 * creativeshop Gulp tasker configuration
 */
import gulp from 'gulp';
import path from 'path';
import loadTasks from 'gulp-task-loader';
import sequence from 'run-sequence';

import environment from './gulp/environment';

/**
 * Load tasks from gulp/tasks directory using gulp-task-loader.
 * @see https://github.com/hontas/gulp-task-loader
 */
loadTasks( path.join( 'gulp', 'tasks' ) );
/**
 *  Task for building entire project.
 */
gulp.task( 'build', ( done ) => {
    sequence(
        'maintain:clean',
        'build:sprites:png',
        [
            'build:sprites:svg',
            'build:scripts',
            'build:styles',

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
} );

/**
 *  Task for project linting.
 */
gulp.task( 'lint', ( done ) => {
    sequence(
        [
            'lint:scripts',
            'lint:styles',
        ],
        done
    );
} );

/**
 *  Task for watching project files.
 */
gulp.task( 'watch', ( done ) => {
    environment.watch = true;
    sequence(
        'build',
        done
    );
} );

/**
 *  Task for serving project files.
 */
gulp.task( 'serve', ( done ) => {
    sequence(
        'watch',
        'maintain:serve',
        done
    );
} );

/**
 *  Task that fires project linting on every commit attempt.
 */
gulp.task( 'pre-push', ( done ) => {
    sequence( 'lint', done );
} );

/**
 *  Default task
 */
gulp.task( 'default', [ 'compile' ] );
