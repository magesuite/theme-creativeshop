/**
 * Origin: Native M2 Collapsible Widget
 * Modification type: extend
 * Reasons:
 * - slide customize section a bit more down due to frequent sticky header - _show method overridden: '- 50' added
 */
define(['jquery'], function($) {
    'use strict';

    return function(mageSlide) {
        $.widget('mage.slide', mageSlide, {
            _show: function() {
                $(this.options.bundleOptionsContainer).slideDown(800);
                $('html, body').animate(
                    {
                        scrollTop:
                            $(this.options.bundleOptionsContainer).offset()
                                .top - 65,
                    },
                    600
                );
                $('#product-options-wrapper > fieldset').focus();
            },
        });

        return $.mage.slide;
    };
});
