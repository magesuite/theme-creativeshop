import breakpoint from '../../../node_modules/creative-patterns/packages/utilities/breakpoint/src/breakpoint';
import ImageTeaser from '../../../node_modules/creative-patterns/packages/components/image-teaser/src/image-teaser';

import $ from 'jquery';

$( '.cs-image-teaser' ).each( ( index: boolean, element: any ): void => {
    new ImageTeaser( $( element ), {
        onInit( swiper: any ): void {
            if ( Boolean( $( element ).data( 'is-slider' ) ) === true && swiper.slides.length % 2 === 0 ) {
                let throttler: number;

                const setSlidesOffset: any = function(): void {
                    swiper.params.slidesOffsetBefore = $( window ).width() < breakpoint.tablet ? 0 : $( swiper.slides[ 0 ] ).width() / 2;
                    swiper.update( true );
                };

                $( window ).resize( function(): void {
                    clearTimeout( throttler );
                    throttler = setTimeout( setSlidesOffset, 250 );
                } );

                setSlidesOffset();
            }
        },
    } );
} );
