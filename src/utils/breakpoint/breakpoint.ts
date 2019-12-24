/**
 * Breakpoint utility imports breakpoints from etc/view.xml
 */

import * as $ from 'jquery';
import * as viewXml from 'etc/view.json';
import deepGet from 'utils/deep-get/deep-get';

let viewportWidth = $(window).width();

const availableBreakpoints = Object.entries(
    deepGet(viewXml, 'vars.Magento_Theme.breakpoints')
);

const getCurrentBreakpoint = (): number => {
    for (let i: number = 0; i < availableBreakpoints.length; i++) {
        if (i === 0) {
            if (viewportWidth < availableBreakpoints[i + 1][1]) {
                return availableBreakpoints[i][1];
            }
        } else if (i === availableBreakpoints.length - 1) {
            if (viewportWidth >= availableBreakpoints[i][1]) {
                return availableBreakpoints[i][1];
            }
        } else if (
            viewportWidth >= availableBreakpoints[i][1] &&
            viewportWidth < availableBreakpoints[i + 1][1]
        ) {
            return availableBreakpoints[i][1];
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
        breakpoint.current = getCurrentBreakpoint();
    },
    passiveOption
);

export default breakpoint;
