define([
    'mage/utils/wrapper',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/action/select-payment-method',
    'underscore',
], function(wrapper, quote, selectPaymentMethod, _) {
    'use strict';

    return function(PaymentService) {
        var setPaymentMethods = wrapper.wrap(
            PaymentService.setPaymentMethods,
            function(originalAction, methods) {
                originalAction(methods);

                if (
                    quote &&
                    !quote.paymentMethod() &&
                    !quote.isVirtual() &&
                    methods.length
                ) {
                    var filteredMethods = _.without(
                        methods,
                        _.find(methods, function(paymentMethod) {
                            return paymentMethod.method === 'free';
                        })
                    );

                    selectPaymentMethod(filteredMethods[0]);
                }
            }
        );

        PaymentService.setPaymentMethods = setPaymentMethods;

        return PaymentService;
    };
});
