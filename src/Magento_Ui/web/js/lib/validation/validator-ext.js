define(['jquery', 'mage/translate'], function ($) {
    'use strict';

    return function (validator) {
        validator.addRule(
            'validate-name',
            function (value) {
                return (
                    $.mage.isEmpty(value) ||
                    /^[\p{L}\p{M},_.`''&'´()\[\]/—\s\d-]+$/u.test(value)
                );
            },
            $.mage.__('Please enter a valid name (no special characters).')
        );

        validator.addRule(
            'validate-city',
            function (value) {
                return (
                    $.mage.isEmpty(value) ||
                    /^[\p{L}\p{M}\s\d,.\-\/\[\]()`''´']+$/u.test(value)
                );
            },
            $.mage.__('Please enter a valid city name (no special characters).')
        );

        validator.addRule(
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

        validator.addRule(
            'validate-phone',
            function (value) {
                return $.mage.isEmpty(value) || /^[\d\s+\-\/()]+$/u.test(value);
            },
            $.mage.__('Please use 0-9, +, -, (, ), / and space only.')
        );

        return validator;
    };
});
