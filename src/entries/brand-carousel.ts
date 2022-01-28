import { ISlider, BrandCarousel } from 'components/brand-carousel';

export function ccBrandCarousel(config: ISlider, element: HTMLElement) {
    new BrandCarousel(element, config);
}
