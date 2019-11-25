/**
 * Provide additional methods to shipping step
 */
define(['jquery'], function($) {
    'use strict';

    return function(Shipping) {
        return Shipping.extend({
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
