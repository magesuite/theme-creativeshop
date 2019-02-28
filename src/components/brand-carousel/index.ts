import * as $ from 'jquery';

import BrandCarousel from 'components/brand-carousel/brand-carousel';
import 'components/brand-carousel/brand-carousel.scss';

$('.cs-brand-carousel').each((i, element) => {
    new BrandCarousel($(element), {
        slidesPerView: 6,
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
