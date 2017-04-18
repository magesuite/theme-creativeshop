/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import BrandCarousel from '../../../node_modules/creative-patterns/packages/components/brand-carousel/src/brand-carousel';
import $ from 'jquery';

if ( $( '.cs-brand-carousel' ).length ) {
    new BrandCarousel( $( '.cs-brand-carousel' ), {
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
    } );
}
