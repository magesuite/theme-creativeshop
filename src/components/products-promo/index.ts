import * as $ from 'jquery';

import ProductsPromo from 'components/products-promo/products-promo';
import 'components/products-promo/products-promo.scss';

const namespace: string = 'cs-';
const $component: JQuery<HTMLElement> = $(`.${namespace}products-promo`);
/**
 * Products Promo component initialization
 */

if ($component.length) {
    new ProductsPromo($component, {
        slideMinWidth: 240,
        simulateTouch: false,
        onPaginationRendered(swiper: any): void {
            swiper.bullets.length <= 1
                ? $(swiper.paginationContainer).hide()
                : $(swiper.paginationContainer).show();
        },
    });
}
