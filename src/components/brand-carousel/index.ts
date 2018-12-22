import * as $ from 'jquery';

import BrandCarousel from 'components/brand-carousel/brand-carousel';
import 'components/brand-carousel/brand-carousel.scss';

const componentClass: string = 'cs-brand-carousel';

$(`.${componentClass}`).each(function(): void {
    new BrandCarousel($(this), {
        spaceBetween: 50,
        slidesPerView: 6,
        centeredSlides: false,
        slideMinWidth: 50,
        roundLengths: false,
        paginationBreakpoint: 10,
        breakpoints: {
            380: {
                slidesPerView: 2,
                spaceBetween: 25,
            },
            480: {
                slidesPerView: 3,
                spaceBetween: 35,
            },
            640: {
                slidesPerView: 4,
            },
            768: {
                slidesPerView: 5,
            },
            960: {
                slidesPerView: 5,
            },
        },
    });
});
