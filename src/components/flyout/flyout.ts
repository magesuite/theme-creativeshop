/* tslint:disable:no-unused-new object-literal-key-quotes */
import $ from 'jquery';
import {IFlyout, Flyout} from 'class.flyout';

$( '.cs-flyout' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  { name: 'cs-flyout', type: 'flyout' } );
} );


