/**
 * Breakpoint utility imports breakpoints from etc/view.xml
 * and creates an object that allows reading all available breakpoints as well as the current one.
 * It emits a special event 'breakpointChange' on every switch between breakpoints.
 * Utility is then attached to the window object and accessible via 'window.breakpoint',
 * to have just one instance that can be accessed from any bundle produced by webpack.
 */

import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

/**
 * Check if breakpoint util already attached
 * as breakpoint might be imported in many bundles
 * but it is not needed to initialize it more than once
 */
if (!window.breakpoint || typeof window.breakpoint !== 'object') {
    let viewportWidth = $(window).width();
    const availableBreakpoints = deepGet(
        viewXml,
        'vars.Magento_Theme.breakpoints'
    );
    const availableBreakpointsEntries = Object.keys(availableBreakpoints).map(
        key => {
            return [key, availableBreakpoints[key]];
        }
    );

    const getCurrentBreakpoint = () => {
        for (let i: number = 0; i < availableBreakpointsEntries.length; i++) {
            if (i === 0) {
                if (viewportWidth < availableBreakpointsEntries[i + 1][1]) {
                    return availableBreakpointsEntries[i][1];
                }
            } else if (i === availableBreakpointsEntries.length - 1) {
                if (viewportWidth >= availableBreakpointsEntries[i][1]) {
                    return availableBreakpointsEntries[i][1];
                }
            } else if (
                viewportWidth >= availableBreakpointsEntries[i][1] &&
                viewportWidth < availableBreakpointsEntries[i + 1][1]
            ) {
                return availableBreakpointsEntries[i][1];
            }
        }
    };

    // Attach breakpoints to window
    window.breakpoint = {
        ...availableBreakpoints,
        current: getCurrentBreakpoint(),
    };

    // Setup resize event:
    let resizeThrottle: ReturnType<typeof setTimeout>;
    let passiveEventOptionSupported: boolean;

    // Check if possible to register passive resize event listener. After:
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#safely_detecting_option_support
    try {
        const options: any = Object.defineProperty({}, 'passive', {
            get: function(): void {
                passiveEventOptionSupported = true;
                return;
            },
        });
        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
    } catch (e) {
        passiveEventOptionSupported = false;
    }

    // Update current breakpoint on every resize.
    window.addEventListener(
        'resize',
        () => {
            clearTimeout(resizeThrottle);

            resizeThrottle = setTimeout(() => {
                viewportWidth = $(window).width();
                const newBreakpoint = getCurrentBreakpoint();

                if (newBreakpoint !== window.breakpoint.current) {
                    /**
                     * Triggers breakpointChange which passess current breakpoint
                     * as a second parameter of a handler:
                     * $(window).on('breakpointChange', (event, breakpoint) => {})
                     */
                    $(window).trigger('breakpointChange', [newBreakpoint]);
                    window.breakpoint.current = newBreakpoint;
                }
            }, 300);
        },
        passiveEventOptionSupported ? { passive: true } : false
    );
}

/**
 * Export left only for compatibility reasons.
 * All the components using
 * "import breakpoint from 'utils/breakpoint/breakpoint'"";
 * should remove this import to use breakpoint directly form the window object.
 */
export default window.breakpoint;
