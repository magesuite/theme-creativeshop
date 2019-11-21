define(
    [
        'ko',
        'Magento_Checkout/js/model/quote',
        'mage/translate',
        'Magento_Ui/js/model/messageList',
    ], function (
        ko,
        quote,
        $t,
        messageList
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

        var mixin = {
            initObservable: function () {
                this._super();

                quote.billingAddress.subscribe(function (address) {
                    if (isAddressPackstationOrPostOffice(address)) {
                        this.isAddressSameAsShipping(false);
                    }
                }, this);

                return this;
            },

            canUseShippingAddress: ko.computed(function () {
                return !isAddressPackstationOrPostOffice(quote.shippingAddress()) && !quote.isVirtual() && quote.shippingAddress() && quote.shippingAddress().canUseForBilling();
            }),

            updateAddress: function () {
                if (isAddressPackstationOrPostOffice(this.selectedAddress())) {
                    messageList.addErrorMessage({
                        message: $t('Packstation or Post office can not be selected as billing address. Please select a different address.')
                    });
                    return;
                }

                this._super();
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
