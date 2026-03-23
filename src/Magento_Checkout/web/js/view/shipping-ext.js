/**
 * Provide additional methods to shipping step
 * Aligned with Magento 2.4.8 in 04/2025
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
                // Create local observable
                isStorePickupComponentActive: ko.observable(false),
                isStorePickupSelected: ko.observable(false),

                // use import -> method form so we can feed the observable
                imports: {
                    // When source changes, Magento calls onStorePickupSelectedChanged(value)
                    isStorePickupSelected:
                        'checkout.steps.store-pickup:isStorePickupSelected',
                },
            },
            initialize: function () {
                this._super();

                var self = this;

                // Detect availability of the store pickup component
                this._initStorePickupComponentCheck();

                registry.async(
                    'checkout.steps.login-or-guest.continue-as-guest.customer-email'
                )(function (element) {
                    if (element) {
                        self.hasEmail(false);
                    }
                });

                return this;
            },

            _initStorePickupComponentCheck: function () {
                var name = 'checkout.steps.store-pickup';
                var self = this;

                // Check if pickup component is already enabled
                var storePickupComponent = registry.get(name);

                if (storePickupComponent) {
                    // Let the template know that the store pickup component is active to render additional attributes
                    this.isStorePickupComponentActive(true);
                } else {
                    // Update observable when the store pickup component is registered later on
                    registry.async(name)(function (component) {
                        if (component) {
                            self.isStorePickupComponentActive(true);
                        }
                    });
                }
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
