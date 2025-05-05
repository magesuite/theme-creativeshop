/**
 * Mixin due to:
 * -> Removed `sidebarModel.hide();` in the `back` and `backToShippingMethod` methods because shipping information is not in the sidebar.
 * Aligned with Magento 2.4.8 in 04/2025
 */
define(['Magento_Checkout/js/model/step-navigator'], function (stepNavigator) {
    'use strict';

    return function (target) {
        return target.extend({
            back: function () {
                stepNavigator.navigateTo('shipping');
            },
            backToShippingMethod: function () {
                stepNavigator.navigateTo('shipping', 'opc-shipping_method');
            },
        });
    };
});
