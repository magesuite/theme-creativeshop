define(['mage/url'], function(url) {
    'use strict';

    var mixin = {
        cartUrl: url.build('checkout/cart'),
    };

    return function(target) {
        // target default cart-items
        return target.extend(mixin); // new result that all other modules receive
    };
});
