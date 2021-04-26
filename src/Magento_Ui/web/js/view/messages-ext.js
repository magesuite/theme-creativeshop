/**
 * Extends time after messages are hidden from 5s to 30s.
 */
define(['ko', 'jquery'], function(ko, $) {
    'use strict';
    return function(Messages) {
        return Messages.extend({
            initialize: function() {
                this._super();

                this.hideSpeed = 500;
                this.hideTimeout = 30000;

                if (
                    this.index.includes(
                        'checkout.steps.billing-step.payment.payments-list'
                    )
                ) {
                    this.messageContainer.errorMessages.subscribe(function() {
                        if ($('.payment-method._active').length) {
                            $('html, body').animate(
                                {
                                    scrollTop: $(
                                        '.payment-method._active'
                                    ).offset().top,
                                },
                                800
                            );
                        }
                    });
                }

                return this;
            },
        });
    };
});
