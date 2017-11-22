/**
 * Add to cart button handler extension that removes "disabled" attribute.
 * Mentioned class was added to prevent user from adding simple product to cart
 * before JavaScript pageCache module has loaded and replaced formKey cached by
 * full page cache with proper one from cookie.
 */
define(['jquery', 'jquery/ui', 'pageCache'], function($) {
    'use strict';

    return function(catalogAddToCart) {
        return $.widget('mage.catalogAddToCart', catalogAddToCart, {
            _create: function() {
                // Remove disabled class from "Add to cart" button.
                this.element
                    .find('.' + this.options.addToCartButtonDisabledClass)
                    .prop('disabled', false);
                // Initialize default _create function.
                this._super();
            },
        });
    };
});
