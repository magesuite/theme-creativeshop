import * as $ from 'jquery';

import ProductsCarousel from 'components/products-carousel/products-carousel';
import 'components/products-carousel/products-carousel.scss';

/**
 * Products Carousel component initialization (does not initialize when product grid enabled)
 */
$('.cs-products-carousel')
    .filter(`:not(.cs-products-carousel--grid)`)
    .each((i, element) => {
        new ProductsCarousel($(element));
    });
