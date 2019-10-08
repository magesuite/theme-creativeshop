/**
 * Mount creativestyle customizations after step shipping of the checkout is loaded
 */
define(['rjsResolver', 'jquery', 'js/checkout', 'mage/translate'], function(
    resolver,
    $,
    bundle
) {
    'use strict';

    /**
     * Add warning for missing number in street field
     */
    function initMissingStreetNumberWarning($shippingForm) {
        var $streetInput = $shippingForm.find('input[name="street[0]"]');
        var $streetInputField = $streetInput.closest('.field');

        $streetInput.on('blur change', function() {
            if ($streetInputField.hasClass('_success')) {
                if (!/\d/.test($streetInput.val())) {
                    $streetInputField.addClass('_warn');
                    if (
                        !$streetInputField.find('.message.warning').length &&
                        !$(
                            '.cs-html-select--autosuggest.cs-html-select--animate'
                        ).length
                    ) {
                        var missingStreetMessage =
                            '<div class="message warning" ><span>' +
                            $.mage.__('Do not forget about street number') +
                            '</span></div>';

                        $streetInput.after(missingStreetMessage);
                    }
                } else {
                    $streetInputField
                        .removeClass('_warn')
                        .find('.message.warning')
                        .remove();
                }
            }
        });
    }

    /**
     * Initializes all of our customizations, invoked when checkout is fully loaded.
     */
    function onCheckoutLoaded() {
        var $shippingAddressForm = $('#co-shipping-form');

        initMissingStreetNumberWarning($shippingAddressForm);

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
