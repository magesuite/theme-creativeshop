/**
 * Breakpoint utility for sharing breakpoints between CSS and JS.
 */

import './breakpoint.scss';

/**
 * Converts dash-case to camelCase.
 * @type {Function}
 */
const camelCase: Function = (input: string): string => {
    return input
        .toLowerCase()
        .replace(/-(.)/g, function(match: string, group: string): string {
            return group.toUpperCase();
        });
};

/**
 * Returns object containign available breakpoints.
 * @return {Object} Object containing avaliable breakpoints in shape { breakpointName: pixelsNumber }
 */
const getAvaliableBreakpoints: Function = (): Object =>
    JSON.parse(
        window
            .getComputedStyle(body, ':before')
            .getPropertyValue('content')
            .slice(1, -1)
            .replace(/\\"/g, '"')
    );

/**
 * Returs current breakpoint set by CSS.
 * @return {number} Current breakpoint in number of pixels.
 */
const getCurrentBreakpoint: Function = (): number =>
    +window
        .getComputedStyle(body, ':after')
        .getPropertyValue('content')
        .replace(/['"]/g, '');

const body: HTMLElement = document.querySelector('body');
/**
 * Module cache to export.
 * @type {Object}
 */
const breakpoint: any = {
    current: getCurrentBreakpoint(),
};

/**
 * Available breakpoints cache.
 */
const breakpoints: object = getAvaliableBreakpoints();
// Extend breakpoint module with available breakpoint keys converted to camelCase.
Object.keys(breakpoints).forEach((breakpointName: string): void => {
    breakpoint[breakpointName] = breakpoints[breakpointName];
});

// Let's check if we can register passive resize event for better performance.
let passiveOption: any = undefined;
try {
    const opts: any = Object.defineProperty({}, 'passive', {
        get: function(): void {
            passiveOption = { passive: true };
        },
    });
    window.addEventListener('test', null, opts);
} catch (e) {}

// Update current breakpoint on every resize.
window.addEventListener(
    'resize',
    () => {
        breakpoint.current = getCurrentBreakpoint();
    },
    passiveOption
);

export default breakpoint;
