/*global define*/
define([
    'ko',
    'jquery',
    'underscore',
    'uiComponent',
    'Magento_Checkout/js/model/step-navigator',
    'Magento_Checkout/js/model/shipping-service',
], function(ko, $, _, Component, stepNavigator, shippingService) {
    'use strict';
    return Component.extend({
        defaults: {
            displayArea: 'next-button',
            template: 'Magento_Checkout/next-button',
            nextButtonSelector:
                '#co-shipping-method-form [data-role="opc-continue"]',
        },
        isDisabled: shippingService.isLoading,
        isVisible: ko.computed(function() {
            var shipping = _.findWhere(stepNavigator.steps(), {
                code: 'shipping',
            });

            return shipping ? shipping.isVisible : ko.observable(false);
        }),
        continueToPayment: function() {
            $(this.nextButtonSelector).trigger('click');
        },
    });
});
