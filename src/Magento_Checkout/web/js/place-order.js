/*global define*/
define([
    'ko',
    'underscore',
    'jquery',
    'uiComponent',
    'Magento_Checkout/js/model/step-navigator',
    'Magento_Checkout/js/model/quote',
], function(ko, _, $, Component, stepNavigator, quote) {
    'use strict';
    return Component.extend({
        defaults: {
            displayArea: 'place-order',
            template: 'Magento_Checkout/place-order',
            placeOrderButtonSelector:
                '.payment-method._active .action.checkout[type="submit"]',
        },
        isPlaceOrderActionAllowed: ko.computed(function() {
            return quote.billingAddress() && quote.paymentMethod();
        }),
        isVisible: ko.computed(function() {
            var payment = _.findWhere(stepNavigator.steps(), {
                code: 'payment',
            });

            return payment ? payment.isVisible : ko.observable(false);
        }),
        placeOrder: function() {
            $(this.placeOrderButtonSelector).trigger('click');
        },
    });
});
