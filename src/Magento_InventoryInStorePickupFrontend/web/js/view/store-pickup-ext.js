/**
 * Aligned with Magento 2.4.9 in 05/2026
 */
define([], function () {
    'use strict';

    // Export 2 obserables to be used in our customization
    return function (StorePickup) {
        return StorePickup.extend({
            defaults: {
                exports: {
                    isStorePickupAvailable: '${ $.provider }:isAvailable',
                    isStorePickupSelected: '${ $.provider }:isStorePickupSelected',
                },
            },

            /**
             * Keyboard navigation for delivery method tabs.
             * Supports Arrow navigation and 'enter'/'space' toggle to be used when screen reader is active
             */
            onDeliveryTabKeydown: function (data, event) {
                const key = event.key;
                const isPickup = this.isStorePickupSelected();
                let target = null;

                switch (key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        target = isPickup ? 'shipping' : 'pickup';
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        target = isPickup ? 'shipping' : 'pickup';
                        break;
                    case 'Home':
                        target = 'shipping';
                        break;
                    case 'End':
                        target = 'pickup';
                        break;
                    case 'Enter':
                    case ' ':
                        // Activate currently focused tab (no toggle if already active)
                        if (event.target.id === 'tab-shipping' && isPickup) {
                            this.selectShipping
                                ? this.selectShipping()
                                : this.isStorePickupSelected(false);
                        } else if (event.target.id === 'tab-pickup' && !isPickup) {
                            this.selectStorePickup
                                ? this.selectStorePickup()
                                : this.isStorePickupSelected(true);
                        }
                        event.preventDefault();
                        return false;
                    default:
                        return true;
                }

                if (target) {
                    const current = isPickup ? 'pickup' : 'shipping';
                    if (target !== current) {
                        if (target === 'shipping') {
                            this.selectShipping
                                ? this.selectShipping()
                                : this.isStorePickupSelected(false);
                        } else {
                            this.selectStorePickup
                                ? this.selectStorePickup()
                                : this.isStorePickupSelected(true);
                        }
                    }

                    // Focus move after bindings update
                    setTimeout(() => {
                        const btn = document.getElementById('tab-' + target);
                        btn && btn.focus();
                    }, 0);
                    event.preventDefault();

                    return false;
                }

                return true;
            },
        });
    };
});
