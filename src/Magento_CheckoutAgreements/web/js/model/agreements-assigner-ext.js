/**
 * Changes in comparison to source file:
 * - modified: agreementForm,
 * Aligned with Magento 2.4.7 in 04/2024
 */
/* tslint:disable one-variable-per-declaration */

define(['jquery'], function ($) {
    'use strict';

    return function (agreementsAssigner) {
        var agreementsConfig = window.checkoutConfig.checkoutAgreements;

        /** Override default place order action and add agreement_ids to request */
        return function (paymentData) {
            var agreementForm, agreementData, agreementIds;

            if (!agreementsConfig.isEnabled) {
                return;
            }

            // agreementForm has to be adjusted to current placement of T&C block
            agreementForm = $(
                '.cs-checkout__agreements div[data-role=checkout-agreements] input'
            );
            agreementData = agreementForm.serializeArray();
            agreementIds = [];

            agreementData.forEach(function (item) {
                agreementIds.push(item.value);
            });

            if (paymentData.extension_attributes === undefined) {
                paymentData.extension_attributes = {};
            }

            paymentData.extension_attributes.agreement_ids = agreementIds;
        };

        return agreementsAssigner;
    };
});
