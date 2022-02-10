/**
 * Provide additional methods to shipping step
 */
define(['jquery', 'uiRegistry', 'knockout'], function($, registry, ko) {
    'use strict';

    return function(Shipping) {
        return Shipping.extend({
            defaults: {
                hasEmail: ko.observable(true),
            },
            initialize: function() {
                this._super();

                var self = this;

                registry.async(
                    'checkout.steps.login-or-guest.continue-as-guest.customer-email'
                )(function(element) {
                    if (element) {
                        self.hasEmail(false);
                    }
                });

                return this;
            },
            enableForm: function() {
                $('#co-shipping-form')
                    .removeClass('cs-form--disabled')
                    .find('input, select, button')
                    .removeAttr('disabled');
            },
            disableForm: function() {
                $('#co-shipping-form')
                    .addClass('cs-form--disabled')
                    .find('input, select, button')
                    .attr('disabled', 'disabled');
            },
        });
    };
});
