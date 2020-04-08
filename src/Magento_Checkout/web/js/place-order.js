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
            /**
             * Visible pseudo class has to be added because PayPal payment method
             * has "_active" class set no matter if it is selected or not. This led to the situation
             * where if you selected some other method, 2 buttons were found and clicked.
             * The button itself on the other hand is being toggled so we can filter it out that way.
             */
            placeOrderButtonSelector:
                '.payment-method._active .action.checkout[type="submit"]:visible',
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
