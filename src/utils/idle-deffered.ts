import * as $ from 'jquery';

export interface IdleDeferred extends JQuery.Deferred<void> {
    force: () => IdleDeferred;
}

/**
 * Returns a jQuery Deferred object which resolves when browser enters idle state.
 * If the browser doesn't support requestIdleCallback, deferred is resolved on window load.
 * It is possible to force resolving using .force() method.
 *
 * @param timeout Optional timeout for waiting for idle state in milliseconds.
 */
export default (timeout?: number): IdleDeferred => {
    const $window = $(window);
    const deferred = $.Deferred() as IdleDeferred;

    const callback = () => {
        deferred.resolve();
    };

    let idleCallback = null;

    deferred.force = () => {
        if ('cancelIdleCallback' in window) {
            cancelIdleCallback(idleCallback);
        } else {
            $window.off('load', callback);
        }

        return deferred.resolve();
    };

    if ('requestIdleCallback' in window) {
        idleCallback = requestIdleCallback(callback, timeout);
    } else {
        $window.on('load', callback);
    }

    return deferred;
};
