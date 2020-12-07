define([
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/select-shipping-method',
    'underscore',
], function(checkoutData, selectShippingMethodAction, _) {
    'use strict';

    return function(CheckoutDataResolver) {
        return _.extend({}, CheckoutDataResolver, {
            isPickInStoreAvailable: function(ratesData) {
                if (ratesData.length) {
                    return ratesData.some(function(rate) {
                        return rate.method_code === 'pickup';
                    });
                }
                return false;
            },
            resolveShippingRates: function(ratesData) {
                CheckoutDataResolver.resolveShippingRates.call(this, ratesData);
                if (
                    ratesData.length &&
                    !this.isPickInStoreAvailable(ratesData) &&
                    !checkoutData.getSelectedShippingRate() &&
                    window.location.pathname.indexOf('cart') === -1
                ) {
                    selectShippingMethodAction(ratesData[0]);
                }
            },
        });
    };
});
