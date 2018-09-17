
/*global define*/
define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/step-navigator',
        'Magento_Checkout/js/model/quote'
    ],
    function (Component, stepNavigator, quote) {
        "use strict";
        return Component.extend({
            defaults: {
                displayArea: 'before-place-order',
                template: 'Magento_Checkout/payment/before-place-order'
            },

            isVisible: function() {
                return stepNavigator.isProcessed( 'shipping' );
            }
        });
    }
);