/**
 * Breakpoint utility for sharing breakpoints between CSS and JS.
 */

import * as $ from 'jquery';

import './breakpoint.scss';

/**
 * Returns object containing available breakpoints.
 * @return {Object} Object containing available breakpoints in shape { breakpointName: pixelsNumber }
 */
const getAvaliableBreakpoints = (): object =>
    JSON.parse(
        window
            .getComputedStyle(body, ':before')
            .getPropertyValue('content')
            .slice(1, -1)
            .replace(/\\"/g, '"')
    );

/**
 * Returns current breakpoint set by CSS.
 * @return {number} Current breakpoint in number of pixels.
 */
const getCurrentBreakpoint = (): number =>
    +window
        .getComputedStyle(body, ':after')
        .getPropertyValue('content')
        .replace(/['"]/g, '');

const body: HTMLElement = document.querySelector('body');
/**
 * Module cache to export.
 * @type {Object}
 */
const breakpoint: any = $.extend(
    {
        current: getCurrentBreakpoint(),
    },
    getAvaliableBreakpoints()
);

// Let's check if we can register passive resize event for better performance.
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
        breakpoint.current = getCurrentBreakpoint();
    },
    passiveOption
);

export default breakpoint;
