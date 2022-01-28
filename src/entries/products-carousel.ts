import { ISlider, ProductsCarousel } from 'components/products-carousel';

export function ccProductsCarousel(config: ISlider, element: HTMLElement) {
    if (!element.classList.contains('cs-products-carousel--grid')) {
        new ProductsCarousel(element, config);
    }
}
