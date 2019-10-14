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

            return this.on(
                type,
                $.proxy(function(event) {
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
            /**
             * By default, Magento focuses on the first validation error and scroll page
             * to have this error on top of the viewport. On PDP we don't want to have this
             * validation error on top, but centred on the viewport
             */
            listenFormValidateHandler: function(event, validation) {
                var firstActive = $(validation.errorList[0].element || []),
                    lastActive = $(
                        validation.findLastActive() ||
                            (validation.errorList.length &&
                                validation.errorList[0].element) ||
                            []
                    ),
                    windowHeight,
                    parent,
                    successList,
                    isProductPage;

                if (lastActive.is(':hidden')) {
                    parent = lastActive.parent();
                    (windowHeight = $(window).height()),
                        $('html, body').animate({
                            scrollTop: parent.offset().top - windowHeight / 2,
                        });
                }

                // ARIA (removing aria attributes if success)
                successList = validation.successList;
                if (successList.length) {
                    $.each(successList, function() {
                        $(this)
                            .removeAttr('aria-describedby')
                            .removeAttr('aria-invalid');
                    });
                }

                if (firstActive.length) {
                    (isProductPage = $('body').hasClass(
                        'catalog-product-view'
                    )),
                        (windowHeight = $(window).height());

                    if (isProductPage) {
                        $('html, body').animate({
                            scrollTop:
                                firstActive.offset().top - windowHeight / 2,
                        });
                    } else {
                        $('html, body').animate({
                            scrollTop: firstActive.offset().top,
                        });
                    }

                    if (!firstActive.hasClass('super-attribute-select')) {
                        firstActive.focus();
                    }
                }
            },
        });

        return $.mage.validation;
    };
});
