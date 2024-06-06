/**
 * Provide additional methods to shipping step
 * Aligned with Magento 2.4.7 in 04/2024
 */
define(['jquery', 'uiRegistry', 'knockout', 'mage/translate'], function (
    $,
    registry,
    ko,
    $t
) {
    'use strict';

    return function (Shipping) {
        return Shipping.extend({
            defaults: {
                hasEmail: ko.observable(true),
            },
            initialize: function () {
                this._super();

                var self = this;

                registry.async(
                    'checkout.steps.login-or-guest.continue-as-guest.customer-email'
                )(function (element) {
                    if (element) {
                        self.hasEmail(false);
                    }
                });

                return this;
            },
            enableForm: function () {
                $('#co-shipping-form')
                    .removeClass('cs-form--disabled')
                    .find('input, select, button')
                    .removeAttr('disabled');
            },
            disableForm: function () {
                $('#co-shipping-form')
                    .addClass('cs-form--disabled')
                    .find('input, select, button')
                    .attr('disabled', 'disabled');
            },
            validateShippingInformation: function () {
                const $customerTab = $('#tab-customer');
                const isLoginTabVisible = $customerTab.is(':visible');

                if (isLoginTabVisible) {
                    registry.get(
                        'checkout.steps.shipping-step.shippingAddress.authentication-tab.errors',
                        (messagesInstance) => {
                            if (messagesInstance?.messageContainer) {
                                messagesInstance.messageContainer.addErrorMessage(
                                    {
                                        message: $t(
                                            'Please log in to continue.'
                                        ),
                                    }
                                );
                            }
                        }
                    );

                    $customerTab.get(0).scrollIntoView({ behavior: 'smooth' });

                    return false;
                }

                return this._super();
            },
        });
    };
});
