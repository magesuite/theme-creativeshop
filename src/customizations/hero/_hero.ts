import $ from 'jquery';

import csTeaser from './../../../node_modules/creative-patterns/packages/components/teaser/src/teaser';

const settings: any = {
    teaserName: 'cs-hero',
    slidesPerView: 'auto',
    spaceBetween: 10,
    autoplay: 5000,
    centeredSlides: true,
    autoHeight: true,
    paginationBreakpoint: 50,
    slideToClickedSlide: true,
    loop: true,
    calculateSlides: false,
    roundLengths: true,
    onSlideChangeStart( swiper: any ): void {
        // StopAutoplay() if slide was changed by user, not by autoplay 
        if ( !swiper.autoplaying ) {
            swiper.stopAutoplay();
            swiper.params.wasInteracted = true;
        }
    },
    onInit( swiper: any ): void {
        swiper.params.wasInteracted = false;

        // On mouseover stop autoplay, on  mouseleave resume it only if there was no interaction with user
        swiper.container.on( {
            mouseover(): void {
                swiper.stopAutoplay();
            },
            mouseleave(): void {
                if ( !swiper.params.wasInteracted ) {
                    swiper.startAutoplay();
                }
            },
        } );
    },
};

// Initialize hero carousels
const init: any = function(): void {
    $( `.${settings.teaserName}` ).each( function(): Object {
        return new csTeaser( $( this ), settings );
    } );
};

export { init };
