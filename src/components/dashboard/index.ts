import 'components/dashboard/dashboard.scss';
import breakpoint from 'utils/breakpoint/breakpoint';
import { SingleOrMany } from 'stickyfilljs';

// Position: sticky detection and polyfill
const stickyPolyfill: void = (function() {
    const el: HTMLElement = document.createElement('a');
    el.style.cssText =
        'position:sticky; position:-webkit-sticky; position:-ms-sticky;';
    const isSupported: boolean = el.style.position.indexOf('sticky') !== -1;
    if (!isSupported) {
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
                        isMobile = !!(window.innerWidth <= breakpoint.tablet);
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
})();
