/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import ProductsPromo from '../../../node_modules/creative-patterns/packages/components/products-promo/src/products-promo';
import $ from 'jquery';

if ( $( '.cs-products-promo' ).length ) {
    new ProductsPromo( $( '.cs-products-promo' ), {
        slideMinWidth: 240,
    } );
}
