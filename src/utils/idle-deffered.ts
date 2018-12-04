import * as $ from 'jquery';

export interface IdleDeferred extends JQuery.Deferred<void> {
    force: () => IdleDeferred;
}

/**
 * Returns a jQuery Deferred object which resolves when browser enters idle state.
 * If the browser doesn't support requestIdleCallback, deferred is resolved immediately.
 * It is possible to force resolving using .force() method.
 *
 * @param timeout Optional timeout for waiting for idle state in milliseconds.
 */
export default (timeout?: number): IdleDeferred => {
    const deferred = $.Deferred() as IdleDeferred;
    const idleSetter = window['requestIdleCallback'];
    const idleCanceller = window['cancelIdleCallback'];

    deferred.force = () => {
        if (idleCanceller) {
            idleCanceller(idleCallback);
        }
        deferred.resolve();

        return deferred;
    };

    if (!idleSetter) {
        deferred.resolve();
        return deferred;
    }

    const idleCallback = idleSetter(() => {
        deferred.resolve();
    }, timeout);

    return deferred;
};
