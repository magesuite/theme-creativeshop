/**
 * Lets you extract deep properties from given object by specifying dot-separate path as a string.
 * Example: deepGet(obj, 'some.nested.keys');
 *
 * @param obj Object to extract path from.
 * @param path Dot-separated path to extract.
 */
export default (obj: any, path: string) => {
    const pathArray = path.split('.');
    let current = obj;

    for (let i = 0; i < pathArray.length; i++) {
        current = current[pathArray[i]];
    }

    return current;
};
