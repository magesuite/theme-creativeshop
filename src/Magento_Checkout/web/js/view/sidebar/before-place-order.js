/**
 * Provides logic to hide/show agreements only on the last step of checkout
 */
define([
    'ko',
    'uiComponent',
    'Magento_Checkout/js/model/step-navigator',
], function (ko, Component, stepNavigator) {
    'use strict';
    return Component.extend({
        defaults: {
            displayArea: 'before-place-order',
            template: 'Magento_Checkout/sidebar/before-place-order',
        },

        isHidden: function () {
            var shipping = stepNavigator.steps().filter(function (step) {
                return step.code === 'shipping';
            })[0];

            return shipping ? shipping.isVisible() : false;
        },
    });
});
