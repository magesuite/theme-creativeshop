define(['uiComponent', 'uiRegistry', 'mage/translate'], function(
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
        initialize: function() {
            this._super();
            var self = this;

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.0'
            )(function(element) {
                self.streetElement1 = element || null;
            });

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.1'
            )(function(element) {
                self.streetElement2 = element || null;
            });

            registry.async(
                'checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.2'
            )(function(element) {
                self.streetElement3 = element;
            });
        },
        streetValueChanged: function(value) {
            var lastStreetElement;
            var combinedText = '';

            if (this.streetElement1) {
                combinedText = this.streetElement1.value();
                lastStreetElement = this.streetElement1;
            }

            if (this.streetElement2) {
                combinedText = combinedText + this.streetElement2.value();
                lastStreetElement = this.streetElement2;
            }

            if (this.streetElement3) {
                combinedText = combinedText + this.streetElement3.value();
                lastStreetElement = this.streetElement3;
            }

            if (lastStreetElement) {
                if (!/\d/.test(combinedText)) {
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
