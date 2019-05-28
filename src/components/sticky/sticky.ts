/**
 * Position: sticky detection and polyfill component
 */

import breakpoint from 'utils/breakpoint/breakpoint';
import SingleOrMany from 'stickyfilljs';

export default class Sticky {
    public static getInstance(): Sticky {
        return Sticky._instance;
    }
    private static _instance: Sticky = new Sticky();
    private _isSupported: boolean;

    private constructor() {
        if (Sticky._instance) {
            throw new Error(
                'Error: Instantiation failed: Use Sticky.getInstance() instead of new.'
            );
        }
        const el: HTMLElement = document.createElement('a');
        el.style.cssText =
            'position:sticky; position:-webkit-sticky; position:-ms-sticky;';
        this._isSupported = !!(el.style.position.indexOf('sticky') !== -1);
        Sticky._instance = this;
    }

    public isSupported(): boolean {
        return this._isSupported;
    }

    // TODO
    public makeSticky(): void {
        // console.log('wywolano');
        if (this._isSupported) {
            import('stickyfilljs')
                .then(Stickyfill => {
                    const stickyElements = Array.prototype.slice.call(
                        document.querySelectorAll('.cs-sticky-block--no-mobile')
                    );

                    if (stickyElements.length > 0) {
                        if (window.innerWidth > breakpoint.tablet) {
                            Stickyfill.add(stickyElements);
                        }

                        // Handling resolution change
                        let isMobile: boolean;
                        let isSticky: boolean;
                        window.onresize = () => {
                            isMobile = !!(
                                window.innerWidth <= breakpoint.tablet
                            );
                            isSticky = !!(Stickyfill.stickies.length > 0);
                            if (!isMobile && !isSticky) {
                                Stickyfill.add(stickyElements);
                            } else if (isMobile && isSticky) {
                                Stickyfill.remove(stickyElements);
                            }
                        };
                    }
                })
                .catch(err => {
                    // tslint:disable-next-line: no-console
                    console.error(
                        "Error: couldn't load 'position: sticky' polyfill."
                    );
                });
        }
    }
}
