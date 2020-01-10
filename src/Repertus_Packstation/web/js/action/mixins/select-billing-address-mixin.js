define(
    [
        'mage/utils/wrapper'
    ], function (
        wrapper
    ) {
        'use strict';

        // Fix for translations in isAddressPackstationOrPostOffice function
        function isAddressPackstationOrPostOffice(address) {
            if (address == null) {
                return false;
            }

            var streetLines = address.street ? address.street : [],
                translations = ['packstation', 'post office', 'postfiliale'];

            return streetLines.some(function (entry) {
                entry = entry.toLowerCase();

                return translations.some(function (translation) {
                    return entry.indexOf(translation) >= 0;
                });
            });
        }

        return function (selectBillingAction) {
            return wrapper.wrap(selectBillingAction, function (originalAction, billingAddress) {
                if (!isAddressPackstationOrPostOffice(billingAddress)) {
                    originalAction(billingAddress);
                }
            });
        };
    });
