/* tslint:disable:no-unused-new object-literal-key-quotes ordered-imports */
import {Flyout} from '../flyout/class.flyout';
import $ from 'jquery';

$( '.cs-dropdown' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  { name: 'cs-dropdown', type: 'dropdown' } );
} );
