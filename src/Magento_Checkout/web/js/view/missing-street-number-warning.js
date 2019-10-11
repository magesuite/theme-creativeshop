define(['uiComponent', 'uiRegistry', 'mage/translate'], function(
    Component,
    registry,
    $t
) {
    'use strict';
    return Component.extend({
        defaults: {
            streetElement: null,
            listens: {
                '${ $.provider }:shippingAddress.street.0':
                    'streetValueChanged',
            },
        },
        initialize: function() {
            this._super();
            var self = this;

            registry.async(
                'name = checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.street.0'
            )(function(element) {
                self.streetElement = element;
            });
        },
        streetValueChanged: function(value) {
            if (this.streetElement) {
                if (!/\d/.test(value)) {
                    this.streetElement.warn(
                        $t('Do not forget about street number')
                    );
                } else {
                    this.streetElement.warn(null);
                }
            }
        },
    });
});
