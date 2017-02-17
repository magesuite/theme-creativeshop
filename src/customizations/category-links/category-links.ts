import $ from 'jquery';
import {Flyout} from '../../../node_modules/creative-patterns/packages/components/flyout/src/flyout';

$( '.cs-category-links-dropdown' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  { name: 'cs-category-links-dropdown', type: 'flyout' } );
} );
