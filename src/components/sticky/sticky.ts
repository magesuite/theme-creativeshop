import requireAsync from 'utils/require-async';

/**
 * Position: sticky detection and polyfill component
 */

interface breakpoint {
    greaterThan?: number;
    lessThan?: number;
}

const isSupported: boolean = (() => {
    const el: HTMLElement = document.createElement('a');
    el.style.cssText =
        'position:sticky; position:-webkit-sticky; position:-ms-sticky;';
    return !!(el.style.position.indexOf('sticky') !== -1);
})();

const makeSticky = (elements: NodeList, breakpoint?: breakpoint): void => {
    if (!isSupported) {
        requireAsync(['Stickyfill'])
            .then(([Stickyfill]) => {
                const elementsArray = Array.prototype.slice.call(elements);
                if (elementsArray.length > 0) {
                    if (breakpoint) {
                        handleStickyWithBreakpoints(
                            Stickyfill,
                            elementsArray,
                            breakpoint,
                            1000
                        );
                    } else {
                        Stickyfill.add(elementsArray);
                    }
                }
            })
            .catch(err => {
                // tslint:disable-next-line: no-console
                console.error(
                    "Error: couldn't load 'position: sticky' polyfill."
                );
            });
    }
};

const handleStickyWithBreakpoints = (
    Stickyfill: any,
    elementsArray: HTMLElement | HTMLElement[],
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
                    Stickyfill.remove(elementsArray);
                    isSticky = false;
                }
            }

            if (breakpoint.lessThan) {
                isAboveThreshold = !!(window.innerWidth >= breakpoint.lessThan);

                if (isSticky && isAboveThreshold) {
                    Stickyfill.remove(elementsArray);
                    isSticky = false;
                }
            }

            if (!(isSticky || isAboveThreshold || isBelowThreshold)) {
                Stickyfill.add(elementsArray);
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
