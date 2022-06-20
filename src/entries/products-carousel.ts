import { ISlider, ProductsCarousel } from 'components/products-carousel';

export function ccProductsCarousel(config: ISlider, element: HTMLElement) {
    new ProductsCarousel(element, config);
}
