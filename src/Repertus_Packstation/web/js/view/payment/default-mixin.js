define(
    [
        'ko',
        'Magento_Checkout/js/model/quote',
        'Magento_Ui/js/model/messageList',
        'Magento_Checkout/js/model/payment-service',
        'Magento_Checkout/js/action/select-payment-method',
        'mage/translate'
    ], function (
        ko,
        quote,
        messageList,
        paymentService,
        selectPaymentMethod,
        $t
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

            initialize: function () {
                var me = this;

                me._super();

                // Update this function add check for Shipping Address
                if (isAddressPackstationOrPostOffice(quote.shippingAddress())) {
                    messageList.addErrorMessage({
                        message: $t('Packstation or Post office can not be selected as billing address. Please select a different address.')
                    });
                    // Select first payment method
                    if (!quote.paymentMethod()) {
                        var paymentMethods = paymentService.getAvailablePaymentMethods();
                        if (paymentMethods.length) {
                            selectPaymentMethod(paymentMethods[0]);
                        }
                    }
                }

                return me;
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
