define([
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/select-shipping-method',
    'underscore',
], function(checkoutData, selectShippingMethodAction, _) {
    'use strict';

    return function(CheckoutDataResolver) {
        return _.extend({}, CheckoutDataResolver, {
            resolveShippingRates: function(ratesData) {
                CheckoutDataResolver.resolveShippingRates.call(this, ratesData);

                if (
                    ratesData.length &&
                    !checkoutData.getSelectedShippingRate()
                ) {
                    selectShippingMethodAction(ratesData[0]);
                }
            },
        });
    };
});
