/**
 * Minicart extension that automatically opens minicart flyout when client adds
 * new product to it.
 * Since we can only know how many items are currently in cart we need to store
 * the previous amount in localstorage and check if it is smaller then current one.
 */
define(['jquery'], function($) {
    'use strict';
    // Cache minicart selectors.
    var $minicart = $('[data-block="minicart"]');
    var $minicartDropdown = $minicart.find('[data-role="dropdownDialog"]');
    // Get number of items stored previously in cart.
    var getPrevNumOfItems = function() {
        return localStorage
            ? parseInt(localStorage.getItem('cs-prev-cart-items'))
            : 0;
    };
    // Update number of remembered items in cart.
    var updateNumOfItems = function(itemsInCart) {
        if (localStorage) {
            localStorage.setItem('cs-prev-cart-items', itemsInCart);
        }
    };
    // Don't hide automatically if user hovers on flyout.
    var minicartCloseTimeout;
    $minicartDropdown.on('hover', () => {
        clearTimeout(minicartCloseTimeout);
    });

    return function(Minicart) {
        return Minicart.extend({
            update: function(updatedCart) {
                // New number of items in cart.
                var itemsInCart = updatedCart.summary_count;

                if (itemsInCart > getPrevNumOfItems()) {
                    $minicartDropdown.dropdownDialog('open');

                    minicartCloseTimeout = setTimeout(function() {
                        $minicartDropdown.dropdownDialog('close');
                    }, 5000);
                }
                updateNumOfItems(itemsInCart);

                return this._super(updatedCart);
            },
        });
    };
});
