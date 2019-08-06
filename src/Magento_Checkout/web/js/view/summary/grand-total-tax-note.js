define(['Magento_Checkout/js/view/summary/abstract-total'], function(
    Component
) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Magento_Checkout/summary/grand-total-tax-note',
        },

        isDisplayed: function() {
            return this.isFullMode();
        },
    });
});
