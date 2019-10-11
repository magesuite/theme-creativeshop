/**
 * Mount creativestyle customizations after step shipping of the checkout is loaded
 */
define(['rjsResolver', 'jquery', 'js/checkout'], function(resolver, $, bundle) {
    'use strict';

    /**
     * Initializes all of our customizations, invoked when checkout is fully loaded.
     */
    function onCheckoutLoaded() {
        var $shippingAddressForm = $('#co-shipping-form');

        bundle.AddressAutofill({
            streetField: $shippingAddressForm.find('input[name="street[0]"]'),
            zipField: $shippingAddressForm.find('input[name="postcode"]'),
            cityField: $shippingAddressForm.find('input[name="city"]'),
            stateField: $shippingAddressForm.find('input[name="region"]'),
            countrySelect: $shippingAddressForm.find(
                'select[name="country_id"]'
            ),
        });

        $('#co-payment-form').on(
            'click',
            '.billing-address-same-as-shipping-block',
            function() {
                var $newBillingAddressForms = $(
                    '.billing-address-form .address'
                );

                $newBillingAddressForms.each(function() {
                    var $newBillingAddressForm = $(this);
                    bundle.AddressAutofill({
                        streetField: $newBillingAddressForm.find(
                            'input[name="street[0]"]'
                        ),
                        zipField: $newBillingAddressForm.find(
                            'input[name="postcode"]'
                        ),
                        cityField: $newBillingAddressForm.find(
                            'input[name="city"]'
                        ),
                        countrySelect: $newBillingAddressForm.find(
                            'select[name="country_id"]'
                        ),
                    });
                });
            }
        );
    }

    /**
     * Initializes assets loading process listener.
     */
    function init() {
        resolver(onCheckoutLoaded);
    }

    return init;
});
