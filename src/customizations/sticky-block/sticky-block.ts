/* tslint:disable:no-unused-new ordered-imports */
import StickyBlock from 'components/sticky-block/sticky-block';
import breakpoint from 'utils/breakpoint/breakpoint';
import $ from 'jquery';

/**
 * StickyBlock component initialization for template
 */
new StickyBlock($('.cs-sticky-block'));

$('.cs-product-gallery').on('gallery:loaded', function(): void {
    if (Stickyfill && Stickyfill.stickies.length) {
        Stickyfill.rebuild();
    }
});
