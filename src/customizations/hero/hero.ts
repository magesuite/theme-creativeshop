/* tslint:disable:no-unused-expression no-unused-new ordered-imports */

import Hero from '../../../node_modules/creative-patterns/packages/components/hero/src/hero';
import $ from 'jquery';

$( '.cs-hero' ).each( function(): void {
    new Hero( $( this ), {
        spaceBetween: 2
    } );
} );
