import * as $ from 'jquery';
import { ProductsCarousel } from 'components/products-carousel';

/**
 * Products Carousel component initialization (does not initialize when product grid enabled)
 */
export function ccProductsCarousel(config, element) {
    const $el: JQuery = $(element);

    if (!$el.hasClass('cs-products-carousel--grid')) {
        new ProductsCarousel($(element), config);
    }
}
