
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
                displayArea: 'place-order',
                template: 'Magento_Checkout/place-order'
            },
            isVisible: function() {
                return !quote.isVirtual() && stepNavigator.isProcessed( 'shipping' );
            }
        });
    }
);
