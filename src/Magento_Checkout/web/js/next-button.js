/*global define*/
define(
    ['ko', 'uiComponent', 'Magento_Checkout/js/model/step-navigator'],
    function(ko, Component, stepNavigator) {
        'use strict';
        return Component.extend({
            defaults: {
                displayArea: 'next-button',
                template: 'Magento_Checkout/next-button',
            },
            isHidden: function() {
                var payment = stepNavigator.steps()[1];

                return payment ? payment.isVisible : ko.observable(false);
            },
        });
    }
);
