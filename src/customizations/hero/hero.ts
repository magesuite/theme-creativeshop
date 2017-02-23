/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import Hero from '../../../node_modules/creative-patterns/packages/components/hero/src/hero';
import $ from 'jquery';

$( '.cs-hero' ).each( function(): void {
    new Hero( $( this ), {
        spaceBetween: 2,
        callbacks: { 
            onInit: function() { 
                $( `.cs-hero` ).find( `.cs-hero__slide--clone` ).each( function( i: number, el: JQuery ) { 
                    let clonedSlideImg = $(el).find( 'img' ); 
                    let clonedSlideImgAlt = clonedSlideImg.attr( 'alt' ); 
                    clonedSlideImg.attr( 'alt', `${clonedSlideImgAlt}-duplicated-${i}`); 
                } ); 
            } 
        }
    } );
} );
