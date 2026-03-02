/**
 * Custom component to show warning if no house number is provided in street address
 *
 * Notes:
 * - listens: watches for changes in the data provider (the data model), not the UI elements,
 * - this.source: data provider - the actual data model that stores the form values,
 * - this.source.get('shippingAddress.street') - accessing the data that actually changed and triggered the listener.
 *   This bypasses the UI element synchronization delay entirely.
 */
define(['uiComponent', 'uiRegistry', 'mage/translate'], function (
    Component,
    registry,
    $t
) {
    'use strict';
    return Component.extend({
        defaults: {
            streetElement1: null,
            streetElement2: null,
            streetElement3: null,
            listens: {
                '${ $.provider }:shippingAddress.street.0':
                    'streetValueChanged',
                '${ $.provider }:shippingAddress.street.1':
                    'streetValueChanged',
                '${ $.provider }:shippingAddress.street.2':
                    'streetValueChanged',
            },
        },
        initialize: function () {
            this._super();
            var self = this;

            // Explicitly resolve this.source via registry to avoid a race condition in some browsers (e.g. Firefox),
            // where listens callbacks can fire before uiComponent assigns this.source automatically.
            registry.async(this.provider)(function (source) {
                self.source = source;
            });

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.0'
            )(function (element) {
                self.streetElement1 = element || null;
            });

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.1'
            )(function (element) {
                self.streetElement2 = element || null;
            });

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.2'
            )(function (element) {
                self.streetElement3 = element;
            });
        },
        streetValueChanged: function () {
            var lastStreetElement;
            var street = this.source.get('shippingAddress.street') || [];

            var combinedText =
                (street[0] || '') + (street[1] || '') + (street[2] || '');

            // Determine last element
            if (this.streetElement3) {
                lastStreetElement = this.streetElement3;
            } else if (this.streetElement2) {
                lastStreetElement = this.streetElement2;
            } else if (this.streetElement1) {
                lastStreetElement = this.streetElement1;
            }

            if (lastStreetElement) {
                if (combinedText.trim() && !/\d/.test(combinedText)) {
                    lastStreetElement.warn(
                        $t('Do not forget about street number')
                    );
                } else {
                    lastStreetElement.warn(null);
                }
            }
        },
    });
});
