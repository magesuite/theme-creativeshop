import * as $ from 'jQuery';

/**
 * Requires given module and returns a promise-like object with result.
 * Array destructuring is require in both .then and .catch callbacks because they can only accept one argument per spec.
 * Example:
 * requireAsync(['jquery', 'underscore']).then(([$, _]) => { console.log($); });
 *
 * @param dependencies Array of dependencies to request.
 */
export default (dependencies: string[] = []): JQuery.Deferred<any[]> => {
    const deferred = jQuery.Deferred();

    requirejs(
        dependencies,
        (...args: any[]) => deferred.resolve(args),
        (...args: any[]) => deferred.reject(args)
    );

    return deferred;
};
