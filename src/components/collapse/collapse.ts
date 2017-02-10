/* tslint:disable:no-unused-new object-literal-key-quotes ordered-imports */
import {Flyout} from '../flyout/class.flyout';
import $ from 'jquery';

$( '.cs-collapse' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  { name: 'cs-collapse', type: 'collapse' } );
} );

$( '.cs-collapse-inside' ).each( ( index: number, element: any ) => {
    new Flyout( $( element ),  {
        name: 'cs-collapse-inside',
        type: 'collapse',
        onShow : function(): void {
            const $trigger: JQuery = $( element ).find('.cs-collapse-inside__trigger .cs-button__span' );
            const showLessText: string = $trigger.data( 'show-less-text' );
            $trigger.text( showLessText );
        },
        onHide : function(): void {
            const $trigger: JQuery = $( element ).find('.cs-collapse-inside__trigger .cs-button__span' );
            const showMoreText: string = $trigger.data( 'show-more-text' );
            $trigger.text( showMoreText );
        },
    } );
} );
