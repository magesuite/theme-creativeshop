
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
                displayArea: 'next-button',
                template: 'Magento_Checkout/next-button'
            },
            isHidden: function() {
                return !quote.isVirtual() && stepNavigator.isProcessed( 'shipping' );
            }
        });
    }
);
