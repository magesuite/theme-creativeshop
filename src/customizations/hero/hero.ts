/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import Hero from '../../../node_modules/creative-patterns/packages/components/hero/src/hero';
import $ from 'jquery';

$( '.cs-hero' ).each( function(): void {
    new Hero( $( this ), {
        spaceBetween: 2,
        callbacks: { 
            onInit: function(): void { 
                $( `.cs-hero` ).find( `.cs-hero__slide--clone` ).each( function( i: number, el: JQuery ): void { 
                    const clonedSlideImg: JQuery = $(el).find( 'img' ); 
                    const clonedSlideImgAlt: string = clonedSlideImg.attr( 'alt' ); 
                    clonedSlideImg.attr( 'alt', `${clonedSlideImgAlt}-duplicated-${i}`); 
                } ); 
            } 
        }
    } );
} );
