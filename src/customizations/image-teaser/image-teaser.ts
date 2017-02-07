import ImageTeaser from '../../../node_modules/creative-patterns/packages/components/image-teaser/src/image-teaser';
import $ from 'jquery';

$( '.cs-image-teaser' ).each( ( index: boolean, element: any ): void => {
    new ImageTeaser( $( element ) );
} );
