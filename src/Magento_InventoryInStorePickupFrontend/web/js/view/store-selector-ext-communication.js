/**
 * Mixin for store-selector.js to enable communication with Store Pickup component
 *
 * Imports the isStorePickupSelected observable from the Store Pickup component to be used in 'store-selector.html' template
 */
define(['ko'], function (ko) {
    'use strict';

    return function (Component) {
        return Component.extend({
            defaults: {
                isStorePickupSelected: ko.observable(false),

                imports: {
                    isStorePickupSelected: 'checkout.steps.store-pickup:isStorePickupSelected',
                },
            },
        });
    };
});
