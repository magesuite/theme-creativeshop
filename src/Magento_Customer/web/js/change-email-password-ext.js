/**
 * Modification type: extend
 * Reasons:
 * - add validation for account email change in UA
 * Aligned with Magento 2.4.7 in 04/2024
 */
define(['jquery', 'jquery-ui-modules/widget'], function ($) {
    'use strict';

    return function (mageChangeEmailPassword) {
        $.widget('mage.changeEmailPassword', mageChangeEmailPassword, {
            _showAll: function () {
                this._super();
                $(this.options.emailSelector).attr(
                    'data-validate',
                    "{required:true, 'validate-email':true}"
                );
            },
        });

        return $.mage.changeEmailPassword;
    };
});
