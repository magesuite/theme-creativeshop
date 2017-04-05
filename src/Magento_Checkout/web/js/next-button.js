/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
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
            isPayment: function() {
                return !quote.isVirtual() && stepNavigator.isProcessed('shipping');
            }
        });
    }
);
