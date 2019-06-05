import requireAsync from 'utils/require-async';

/**
 * Position: sticky detection and polyfill component
 */

interface breakpoint {
    greaterThan?: number;
    lessThan?: number;
}

const isSupported: boolean = (() => {
    const el: Element = document.createElement('a');
    el.style.cssText =
        'position:sticky; position:-webkit-sticky; position:-ms-sticky;';
    return !!(el.style.position.indexOf('sticky') !== -1);
})();

const makeSticky = (element: Element, breakpoint?: breakpoint): void => {
    if (!isSupported) {
        requireAsync(['Stickyfill']).then(([Stickyfill]) => {
            if (element) {
                if (breakpoint) {
                    handleStickyWithBreakpoints(
                        Stickyfill,
                        element,
                        breakpoint,
                        1000
                    );
                } else {
                    Stickyfill.add(element);
                }
            }
        });
    }
};

const handleStickyWithBreakpoints = (
    Stickyfill: any,
    element: Element,
    breakpoint: breakpoint,
    throttling?: number
) => {
    let isThrottled = false;
    const throttleTime = throttling > 0 ? throttling : 0;
    let isSticky: boolean = false;
    let isAboveThreshold: boolean = false;
    let isBelowThreshold: boolean = false;

    const resizeHandler = (): void => {
        if (!isThrottled) {
            if (breakpoint.greaterThan) {
                isBelowThreshold = !!(
                    window.innerWidth <= breakpoint.greaterThan
                );

                if (isSticky && isBelowThreshold) {
                    Stickyfill.remove(element);
                    isSticky = false;
                }
            }

            if (breakpoint.lessThan) {
                isAboveThreshold = !!(window.innerWidth >= breakpoint.lessThan);

                if (isSticky && isAboveThreshold) {
                    Stickyfill.remove(element);
                    isSticky = false;
                }
            }

            if (!(isSticky || isAboveThreshold || isBelowThreshold)) {
                Stickyfill.add(element);
                isSticky = true;
            }

            if (throttleTime > 0) {
                isThrottled = true;
                setTimeout(() => {
                    isThrottled = false;
                }, throttleTime);
            }
        }
    };

    resizeHandler();
    window.addEventListener('resize', resizeHandler);
};

export default makeSticky;
