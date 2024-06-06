/**
 * Extends for passing store address to template to display in summary
 * File name "ext-ext" because store pickup already extends shipping-information module
 * Aligned with Magento 2.4.7 in 04/2024
 */
define([
    'Magento_Checkout/js/model/quote',
    'Magento_Customer/js/customer-data',
], function (quote, customerData) {
    'use strict';

    var countryData = customerData.get('directory-data');

    return function (shippingInformation) {
        return shippingInformation.extend({
            /**
             * @param {*} countryId
             * @return {String}
             */
            getCountryName: function (countryId) {
                return countryData()[countryId] !== undefined
                    ? countryData()[countryId].name
                    : '';
            },

            /**
             * @return {Object}
             */
            address: function () {
                return quote.shippingAddress();
            },
        });
    };
});
