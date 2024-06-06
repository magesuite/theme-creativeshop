/**
 * Aligned with Magento 2.4.7 in 04/2024
 */
define([], function () {
    'use strict';

    // Export 2 obserables to be used in our customization
    return function (StorePickup) {
        return StorePickup.extend({
            defaults: {
                exports: {
                    isStorePickupAvailable: '${ $.provider }:isAvailable',
                    isStorePickupSelected:
                        '${ $.provider }:isStorePickupSelected',
                },
            },
        });
    };
});
