/*global define*/
define(
    ['ko', 'uiComponent', 'Magento_Checkout/js/model/step-navigator'],
    function (ko, Component, stepNavigator) {
        'use strict';
        return Component.extend({
            defaults: {
                displayArea: 'place-order',
                template: 'Magento_Checkout/place-order',
            },
            isHidden: function () {
                var shipping = stepNavigator.steps().filter(function (step) {
                    return step.code === 'shipping';
                })[0];

                return shipping.isVisible;
            },
        });
    });
