/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import ProductsPromo from 'components/products-promo/products-promo';
import * as $ from 'jquery';

if ($('.cs-products-promo').length) {
    new ProductsPromo($('.cs-products-promo'), {
        slideMinWidth: 240,
        simulateTouch: false,
        onPaginationRendered(swiper: any): void {
            swiper.bullets.length <= 1
                ? $(swiper.paginationContainer).hide()
                : $(swiper.paginationContainer).show();
        },
    });
}
