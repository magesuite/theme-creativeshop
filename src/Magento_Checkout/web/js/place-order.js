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
    function (Component, stepNavigator, quote) {
        "use strict";
        return Component.extend({
            defaults: {
                displayArea: 'place-order',
                template: 'Magento_Checkout/place-order'
            },

            isVisible: function() {
                return stepNavigator.getActiveItemIndex() == 1;
            }
        });
    }
);