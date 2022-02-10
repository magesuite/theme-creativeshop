define(['jquery', 'mage/url', 'Magento_Checkout/js/model/sidebar'], function(
    $,
    url,
    sidebarModel
) {
    'use strict';

    var mixin = {
        cartUrl: url.build('checkout/cart'),
        setModalElement: function(element) {
            sidebarModel.setPopup($(element));
        },
    };

    return function(target) {
        // target default cart-items
        return target.extend(mixin); // new result that all other modules receive
    };
});
