/**
 * Minicart extension that automatically opens minicart flyout when client adds
 * new product to it.
 * Since we can only know how many items are currently in cart we need to store
 * the previous amount in localstorage and check if it is smaller then current one.
 */
define(['jquery', 'Magento_Ui/js/lib/core/storage/local'], function(
    $,
    storage
) {
    'use strict';
    // Cache minicart selectors.
    var $minicart = $('[data-block="minicart"]');
    var $minicartDropdown = $minicart.find('[data-role="dropdownDialog"]');
    // Get number of items stored previously in cart.
    var getPrevNumOfItems = function() {
        return parseInt(storage.get('cs-prev-cart-items')) || 0;
    };
    // Update number of remembered items in cart.
    var updateNumOfItems = function(itemsInCart) {
        storage.set('cs-prev-cart-items', itemsInCart);
    };
    // Don't hide automatically if user hovers on flyout.
    var minicartCloseTimeout;
    $minicartDropdown.on('hover', function() {
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
