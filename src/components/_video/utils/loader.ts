/**
 * Get global variable if exists
 * @param key
 * @returns
 */
const getGlobal = (key: string): null | (() => unknown) => {
    if (window[key]) {
        return window[key];
    }
    if (window.exports && window.exports[key]) {
        return window.exports[key];
    }
    if (window.module && window.module.exports && window.module.exports[key]) {
        return window.module.exports[key];
    }
    return null;
};

/**
 * Load script in document head, throw error
 * @param src
 * @param callback
 */
const loadScript = (
    src: string,
    callback = (err = null, script: HTMLScriptElement): void => undefined
): void => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    script.onload = function() {
        this.onerror = this.onload = null;
        callback(null, script);
    };
    script.onerror = function() {
        this.onerror = this.onload = null;
        callback(new Error('Failed to load ' + this.src), script);
    };

    head.appendChild(script);
};

const requests = {};
/**
 * Request SDKs if not available and return them as value of resolved Promise
 * @param url
 * @param sdkGlobal
 * @param sdkReady
 * @param requireJsNeeded
 * @returns
 */
const getSDK = (
    url: string,
    sdkGlobal: string,
    sdkReady: string | null = null,
    requireJsNeeded: boolean = false
): Promise<any> => {
    const existingGlobal = getGlobal(sdkGlobal);

    if (existingGlobal) {
        return Promise.resolve(existingGlobal);
    }

    return new Promise((resolve, reject) => {
        // If we are already loading the SDK, add the resolve and reject
        // functions to the existing array of requests
        if (requests[url]) {
            requests[url].push({ resolve, reject });
            return;
        }

        requests[url] = [{ resolve, reject }];

        const onLoaded = sdk => {
            // When loaded, resolve all pending request promises
            requests[url].forEach(request => request.resolve(sdk));
        };

        if (sdkReady) {
            const previousOnReady = window[sdkReady];

            window[sdkReady] = function() {
                if (previousOnReady) {
                    previousOnReady();
                }
                onLoaded(getGlobal(sdkGlobal));
            };
        }

        // Some SDKs that are using define() have to be loaded via requireJs
        if (requireJsNeeded) {
            requirejs(
                [url],
                function(Player) {
                    window[sdkGlobal] = Player;
                    onLoaded(window[sdkGlobal]);
                },
                err => {
                    if (err) {
                        // Loading the SDK failed – reject all requests and
                        // reset the array of requests for this SDK
                        requests[url].forEach(request => request.reject(err));
                        requests[url] = null;
                    }
                }
            );
        } else {
            loadScript(url, err => {
                if (err) {
                    // Loading the SDK failed – reject all requests and
                    // reset the array of requests for this SDK
                    requests[url].forEach(request => request.reject(err));
                    requests[url] = null;
                } else if (!sdkReady) {
                    onLoaded(getGlobal(sdkGlobal));
                }
            });
        }
    });
};

export { getSDK, getGlobal };
