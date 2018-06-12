import $ from 'jquery';

window.addEventListener('orientationchange', function() {
    const cartTable: any = $('#shopping-cart-table');

    cartTable.css('display', 'none');

    setTimeout(function() {
        cartTable.css('display', '');
    }, 10);
});
