/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import ProductsPromo from '../../../node_modules/creative-patterns/packages/components/products-promo/src/products-promo';
import $ from 'jquery';

if ($('.cs-products-promo').length) {
    new ProductsPromo($('.cs-products-promo'), {
        slideMinWidth: 240,
        simulateTouch: false,
        onSlideChangeStart(swiper: any): void {
            $(document).trigger('destroyItemClones');
        },
        onPaginationRendered(swiper: any): void {
            swiper.bullets.length <= 1
                ? $(swiper.paginationContainer).hide()
                : $(swiper.paginationContainer).show();
        },
    });
}
