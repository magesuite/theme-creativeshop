/* tslint:disable:no-unused-new ordered-imports */
import StickyBlock from '../../../node_modules/creative-patterns/packages/components/sticky-block/src/sticky-block';
import breakpoint from '../../../node_modules/creative-patterns/packages/utilities/breakpoint/src/breakpoint';
import $ from 'jquery';

/**
 * StickyBlock component initialization for template
 */
new StickyBlock( $( '.cs-sticky-block' ) );

$( '.cs-product-gallery' ).on( 'gallery:loaded', function(): void {
    if ( Stickyfill && Stickyfill.stickies.length ) {
        Stickyfill.rebuild();
    }
} );
