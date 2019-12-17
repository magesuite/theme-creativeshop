define([
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/checkout-data',
    'Magento_Checkout/js/action/select-shipping-method',
    'underscore',
], function(quote, checkoutData, selectShippingMethodAction, _) {
    'use strict';

    function isAddressPackstationOrPostOffice(address) {
        if (address == null) {
            return false;
        }

        var streetLines = address.street ? address.street : [],
            translations = ['packstation', 'post office', 'postfiliale'];

        return streetLines.some(function (entry) {
            entry = entry.toLowerCase();

            return translations.some(function (translation) {
                return entry.indexOf(translation) >= 0;
            });
        });
    }

    return function(CheckoutDataResolver) {
        return _.extend({}, CheckoutDataResolver, {
            resolveShippingRates: function(ratesData) {
                CheckoutDataResolver.resolveShippingRates.call(this, ratesData);
                if (
                    ratesData.length &&
                    !checkoutData.getSelectedShippingRate() &&
                    window.location.pathname.indexOf('cart') === -1
                ) {
                    selectShippingMethodAction(ratesData[0]);
                }
            },
            applyBillingAddress: function() {
                if (!isAddressPackstationOrPostOffice(quote.shippingAddress())) {
                    CheckoutDataResolver.applyBillingAddress();
                }
            }
        });
    };
});
