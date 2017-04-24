/* tslint:disable:no-unused-new object-literal-key-quotes ordered-imports */
import $ from 'jquery';

window.addEventListener( 'orientationchange', function () {

    let cartTable: any = $( '#shopping-cart-table' );

    cartTable.css( 'display', 'none' );

    setTimeout( function () {
        cartTable.css( 'display', '' );
    }, 10 );

});
