import * as $ from 'jquery';
import { BrandCarousel } from 'components/brand-carousel';

export function ccBrandCarousel(config, element) {
    new BrandCarousel($(element), config);
}
