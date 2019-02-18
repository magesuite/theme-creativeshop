define(['jquery'], function($) {
    'use strict';

    return function(mageValidation) {
        $.fn.validateDelegate = function(delegate, type, handler) {
            /**
             * By default Magento allows events to be attached only to form fields while
             * all validation is registered for whole form elements. This prevents
             * any event listeners like focusout or keydown from being properly attached and fired.
             */
            if (!this[0].form && !this.is('form')) {
                return this;
            }

            return this.bind(type, function(event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        };

        $.widget('mage.validation', mageValidation, {
            options: {
                // Restore default focusout validation.
                onfocusout: $.validator.defaults.onfocusout,
                // Validates on keyup but only when user corrects invalid field to give early feedback.
                onkeyup: function(element, event) {
                    if (!element.classList.contains(this.settings.errorClass)) {
                        return;
                    }

                    $.validator.defaults.onkeyup.call(this, element, event);
                },
            },
        });
    };
});
