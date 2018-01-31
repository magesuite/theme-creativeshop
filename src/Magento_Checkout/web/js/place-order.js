/*global define*/
define(
    ['ko', 'uiComponent', 'Magento_Checkout/js/model/step-navigator'],
    function(ko, Component, stepNavigator) {
        'use strict';
        return Component.extend({
            defaults: {
                displayArea: 'place-order',
                template: 'Magento_Checkout/place-order',
            },
            isHidden: function() {
                var shipping = stepNavigator.steps()[0];

                return shipping ? shipping.isVisible : ko.observable(false);
            },
        });
    }
);
