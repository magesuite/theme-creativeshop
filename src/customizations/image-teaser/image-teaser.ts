import breakpoint from '../../../node_modules/creative-patterns/packages/utilities/breakpoint/src/breakpoint';
import ImageTeaser from '../../../node_modules/creative-patterns/packages/components/image-teaser/src/image-teaser';

import $ from 'jquery';

$( `.cs-image-teaser` ).each( ( index: number, element: any ): void => {
    let images: any = [];

    new ImageTeaser( $( element ), {
        onLazyImageReady( swiper: any, slide: any, image: any ): void {
            images.push( image );

            if ( images.length >= swiper.params.slidesPerView && swiper.container.hasClass( 'cs-image-teaser__wrapper--content-display-outside' ) && swiper.prevButton.length && swiper.nextButton.length ) {
                let throttler: number;
                let $tallestImage: any;

                const setNavButtonsPosition: any = function(): void {
                    if ( $( window ).width() >= breakpoint.tablet && $( element ).hasClass( 'cs-image-teaser--slider' ) ) {
                        let h: number = 0;

                        swiper.slides.each( ( idx: number, el: any ): void => {
                            const $img: any = $( el ).find( '.cs-image-teaser__image' );
                            if ( $img.length && $img.outerHeight() > h ) {
                                $tallestImage = $( el ).find( '.cs-image-teaser__image' );
                                h = $tallestImage.outerHeight();
                            }
                        } );

                        if ( $tallestImage.length ) {
                            const newNavPosition: number = h / 2;
                            swiper.prevButton.css( 'top', newNavPosition );
                            swiper.nextButton.css( 'top', newNavPosition );
                        }
                    }
                };

                const resizeListener: any = function (): void {
                    clearTimeout( throttler );
                    throttler = setTimeout( setNavButtonsPosition, 250 );
                };

                $( window ).on('resize', resizeListener);

                setNavButtonsPosition();
            }
        },
    } );
} );
