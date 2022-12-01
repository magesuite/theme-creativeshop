/*global define*/
define([
    'ko',
    'jquery',
    'underscore',
    'Magento_Checkout/js/model/quote',
    'MageSuite_PackstationDhl/js/model/packstations-service',
], function (ko, $, _, quote, packstationsService) {
    'use strict';

    return function (NextButton) {
        return NextButton.extend({
            continueToPayment: function () {
                if (this.isPackstationSelected()) {
                    $(
                        '#checkout-step-packstation-selector .form-continue'
                    ).submit();
                } else {
                    this._super();
                }
            },
            canContinueToPayment: function () {
                if (this.isPackstationSelected()) {
                    return Boolean(packstationsService.selectedPackstation());
                }

                return this._super();
            },
            isPackstationSelected: function () {
                return _.isMatch(quote.shippingMethod(), {
                    carrier_code: 'dhl_packstation',
                    method_code: 'dhl_packstation',
                });
            },
        });
    };
});
