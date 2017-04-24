/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*global define*/
define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/step-navigator'
    ],
    function (Component, stepNavigator ) {
        "use strict";
        return Component.extend({
            defaults: {
                displayArea: 'before-place-order',
                template: 'Magento_Checkout/payment/before-place-order'
            },

            isVisible: function() {
                return stepNavigator.getActiveItemIndex() == 1;
            }
        });
    }
);