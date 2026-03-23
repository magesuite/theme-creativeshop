/* tslint:disable one-variable-per-declaration */

define(['jquery', 'jquery-ui-modules/widget'], function ($) {
    'use strict';

    return function (mageValidation) {
        $.fn.validateDelegate = function (delegate, type, handler) {
            /**
             * By default Magento allows events to be attached only to form fields while
             * all validation is registered for whole form elements. This prevents
             * any event listeners like focusout or keydown from being properly attached and fired.
             */
            if (!this[0].form && !this.is('form')) {
                return this;
            }

            return this.on(
                type,
                $.proxy(function (event) {
                    var target = $(event.target);
                    var form = target[0].form || target[0];

                    if (
                        form &&
                        $(form).is(this) &&
                        $.data(form, 'validator') &&
                        target.is(delegate) &&
                        !target.is('.swatch-input')
                    ) {
                        return handler.apply(target, arguments);
                    }
                }, this)
            );
        };

        $.widget('mage.validation', $.mage.validation, {
            options: {
                // Restore default focusout validation.
                onfocusout: $.validator.defaults.onfocusout,
                // Validates on keyup but only when user corrects invalid field to give early feedback.
                onkeyup: function (element, event) {
                    if (!element.classList.contains(this.settings.errorClass)) {
                        return;
                    }

                    $.validator.defaults.onkeyup.call(this, element, event);
                },
            },

            _create: function () {
                this.element.on('submit', function (e) {
                    if (
                        $(this).data('mageValidation') &&
                        !$(this).validation('isValid')
                    ) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return false;
                    }
                });

                this._super();
            },

            /**
             * Scope handler to the widget instance
             */
            _listenFormValidate: function () {
                this.element.on(
                    'invalid-form.validate',
                    this.listenFormValidateHandler
                );
            },
        });

        $.validator.addMethod(
            'validate-name',
            function (value) {
                return (
                    $.mage.isEmpty(value) ||
                    /^[\p{L}\p{M},_.`'’&‘´()\[\]/—\s\d-]+$/u.test(value)
                );
            },
            $.mage.__('Please enter a valid name (no special characters).')
        );

        $.validator.addMethod(
            'validate-city',
            function (value) {
                return (
                    $.mage.isEmpty(value) ||
                    /^[\p{L}\p{M}\s\d,.\-\/\[\]()`‘’´']+$/u.test(value)
                );
            },
            $.mage.__('Please enter a valid city name (no special characters).')
        );

        $.validator.addMethod(
            'validate-street-name',
            function (value) {
                return (
                    $.mage.isEmpty(value) ||
                    /^[\p{L}\p{M}"\[\],.\-''`'´—#°&_()\\/\s\d]+$/u.test(value)
                );
            },
            $.mage.__(
                'Please enter a valid street name (no special characters).'
            )
        );

        $.validator.addMethod(
            'validate-phone',
            function (value) {
                return $.mage.isEmpty(value) || /^[\d\s+\-\/()]+$/u.test(value);
            },
            $.mage.__('Please use 0-9, +, -, (, ), / and space only.')
        );

        return $.mage.validation;
    };
});
