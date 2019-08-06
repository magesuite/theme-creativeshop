define(['Magento_Checkout/js/view/summary/abstract-total'], function(
    Component
) {
    'use strict';

    return Component.extend({
        defaults: {
            template:
                'Magento_Checkout/templates/cart/totals/grand-total-tax-note',
        },
        isTaxDisplayedInGrandTotal:
            window.checkoutConfig.includeTaxInGrandTotal || false,

        isDisplayed: function() {
            return this.isFullMode();
        },
    });
});
