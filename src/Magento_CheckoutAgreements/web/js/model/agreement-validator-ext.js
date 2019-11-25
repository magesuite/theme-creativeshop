define(['jquery', 'mage/validation'], function($) {
    'use strict';

    // NOTE: Changes in comparison to source file:
    // - modified: agreementsInputPath,

    return function(agreementValidator) {
        var checkoutConfig = window.checkoutConfig,
            agreementsConfig = checkoutConfig
                ? checkoutConfig.checkoutAgreements
                : {},
            // agreementsInputPath has to be adjusted to current placement of T&C block
            agreementsInputPath =
                '.cs-checkout__agreements div.checkout-agreements input';

        /**
         * Validate checkout agreements
         *
         * @returns {Boolean}
         */
        agreementValidator.validate = function() {
            var isValid = true;

            if (
                !agreementsConfig.isEnabled ||
                $(agreementsInputPath).length === 0
            ) {
                return true;
            }

            $(agreementsInputPath).each(function(index, element) {
                if (
                    !$.validator.validateSingleElement(element, {
                        errorElement: 'div',
                    })
                ) {
                    isValid = false;
                }
            });

            return isValid;
        };

        return agreementValidator;
    };
});
