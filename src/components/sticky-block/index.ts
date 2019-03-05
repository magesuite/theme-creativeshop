import * as $ from 'jquery';
import StickyBlock from 'components/sticky-block/sticky-block';
import 'components/sticky-block/sticky-block.scss';

/**
 * StickyBlock component initialization for template
 */
new StickyBlock($('.cs-sticky-block'));

$('.cs-product-gallery').on('gallery:loaded', function(): void {
    if (Stickyfill && Stickyfill.stickies.length) {
        Stickyfill.rebuild();
    }
});
