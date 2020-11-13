/**
 * Breakpoint utility imports breakpoints from etc/view.xml
 */

import * as $ from 'jquery';
import viewXml from 'etc/view';
import deepGet from 'utils/deep-get/deep-get';

let viewportWidth = $(window).width();

const availableBreakpoints = deepGet(viewXml, 'vars.Magento_Theme.breakpoints');

const getCurrentBreakpoint = (): number => {
    const availableBreakpointsEntries: any = Object.keys(
        availableBreakpoints
    ).map(key => {
        return [key, availableBreakpoints[key]];
    });

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

/**
 * Module cache to export.
 * @type {Object}
 */
const breakpoint: any = $.extend(
    {
        current: getCurrentBreakpoint(),
    },
    availableBreakpoints
);

// Register passive resize event for better performance.
let passiveOption: any;
try {
    const opts: any = Object.defineProperty({}, 'passive', {
        get: function(): void {
            passiveOption = { passive: true };
        },
    });
    window.addEventListener('test', null, opts);
} catch (e) {
    // Do nothing.
}

// Update current breakpoint on every resize.
window.addEventListener(
    'resize',
    () => {
        viewportWidth = $(window).width();

        const newBreakpoint = getCurrentBreakpoint();

        if (newBreakpoint !== breakpoint.current) {
            $(window).trigger('breakpointChange', [newBreakpoint]);
        }

        breakpoint.current = newBreakpoint;
    },
    passiveOption
);

export default breakpoint;
