define(['jquery'], function($) {
    'use strict';

    return function(mageValidation) {
        // var originValidateDelegate = $.fn.validateDelegate;
        // /**
        //  * @return {*}
        //  */
        // $.fn.validateDelegate = function() {
        //     // ----------------------------------------
        //     // Original Magento overloaded code didn't allow events delegated to form element,
        //     // only to fields. No idea why.
        //     if (!this[0].form && !this.is('form')) {
        //         return this;
        //     }

        //     return originValidateDelegate.apply(this, arguments);
        // };

        $.widget('mage.validation', mageValidation, {
            options: {
                onfocusout: $.validator.defaults.onfocusout,
                // Validates on keyup but only when user corrects invalid field.
                onkeyup: function(element, event) {
                    debugger;
                    if (event.which == 9 && this.elementValue(element) === '') {
                        return;
                    } else if (
                        $(element).hasClass(this.settings.errorClass) &&
                        (element.name in this.submitted ||
                            element === this.lastActive)
                    ) {
                        this.element(element);
                    }
                },
            },
        });
    };
});
