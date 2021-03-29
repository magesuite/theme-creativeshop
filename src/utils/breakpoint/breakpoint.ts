/**
 * Breakpoint utility imports breakpoints from etc/view.xml
 * and creates an object that allows reading all available breakpoints as well as the current one.
 * It emits a special event 'breakpointChange' on every switch between breakpoints.
 * Utility is then attached to the window object and accessible via 'window.breakpoint',
 * to have just one instance that can be accessed from any bundle produced by webpack
 */

import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

const availableBreakpoints = deepGet(viewXml, 'vars.Magento_Theme.breakpoints');

class Breakpoint {
    private _viewportWidth = $(window).width();
    private _resizeThrottle: ReturnType<typeof setTimeout>;
    private _availableBreakpointsEntries: any;
    public current: number;

    public constructor() {
        this._availableBreakpointsEntries = Object.keys(
            availableBreakpoints
        ).map(key => {
            return [key, availableBreakpoints[key]];
        });

        this.current = this._getCurrentBreakpoint();
        this._setupResizeEvent();
    }

    private _isPassiveOptionSupported(): boolean {
        // Check if possible to register passive resize event listener. After:
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#safely_detecting_option_support

        let passiveOptionSupported: boolean;
        try {
            const options: any = Object.defineProperty({}, 'passive', {
                get: function(): void {
                    passiveOptionSupported = true;
                    return;
                },
            });
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (e) {
            passiveOptionSupported = false;
        }

        return passiveOptionSupported;
    }

    private _setupResizeEvent(): void {
        // Update current breakpoint on every resize.
        window.addEventListener(
            'resize',
            () => {
                clearTimeout(this._resizeThrottle);

                this._resizeThrottle = setTimeout(() => {
                    this._viewportWidth = $(window).width();
                    const newBreakpoint = this._getCurrentBreakpoint();

                    if (newBreakpoint !== this.current) {
                        /**
                         * Triggers breakpointChange which passess current breakpoint
                         * as a second parameter of a handler:
                         * $(window).on('breakpointChange', (event, breakpoint) => {})
                         */
                        $(window).trigger('breakpointChange', [newBreakpoint]);
                    }

                    this.current = newBreakpoint;
                }, 300);
            },
            this._isPassiveOptionSupported ? { passive: true } : false
        );
    }

    private _getCurrentBreakpoint(): number {
        for (
            let i: number = 0;
            i < this._availableBreakpointsEntries.length;
            i++
        ) {
            if (i === 0) {
                if (
                    this._viewportWidth <
                    this._availableBreakpointsEntries[i + 1][1]
                ) {
                    return this._availableBreakpointsEntries[i][1];
                }
            } else if (i === this._availableBreakpointsEntries.length - 1) {
                if (
                    this._viewportWidth >=
                    this._availableBreakpointsEntries[i][1]
                ) {
                    return this._availableBreakpointsEntries[i][1];
                }
            } else if (
                this._viewportWidth >=
                    this._availableBreakpointsEntries[i][1] &&
                this._viewportWidth <
                    this._availableBreakpointsEntries[i + 1][1]
            ) {
                return this._availableBreakpointsEntries[i][1];
            }
        }
    }
}

/**
 * Attaches breakpoint to window only once,
 * as breakpoint might be imported in many bundles, what's not needed.
 */
if (typeof window.breakpoint !== 'function') {
    const breakpoint = {
        ...new Breakpoint(),
        ...availableBreakpoints,
    };

    window.breakpoint = breakpoint;
}

/**
 * Export left only for compatibility reasons.
 * All the components using
 * "import breakpoint from 'utils/breakpoint/breakpoint'"";
 * should remove this import to use breakpoint directly form the window object.
 */
export default window.breakpoint;
