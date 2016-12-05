/* tslint:disable:no-unused-new object-literal-key-quotes */
import $ from 'jquery';
import {IFlyout, Flyout} from '../flyout/class.flyout';

$( '.cs-collapse' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  { name: 'cs-collapse', type: 'collapse' } );
} );