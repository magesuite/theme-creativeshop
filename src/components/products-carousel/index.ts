import * as $ from 'jquery';

import ProductsCarousel from 'components/products-carousel/products-carousel';
import 'components/products-carousel/products-carousel.scss';

const componentClass: string = 'cs-products-carousel'
const $component: JQuery<HTMLElement> = $(`.${componentClass}`);

/**
 * Products Carousel component initialization
 */
if ($component.length) {
    new ProductsCarousel($component);
}
