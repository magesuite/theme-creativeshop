/**
 * Mount creativestyle customizations after step shipping of the checkout is loaded
 */
define([
    'rjsResolver',
    'jquery',
    'mage/validation',
    'js/checkout',
    'mage/translate',
], function(resolver, $, validation, bundle) {
    'use strict';

    /**
     * Initializes inline validation for shipping information form fields
     * including custom logic for street name.
     */
    function initInlineValidation($shippingForm) {
        $shippingForm.find('input').each(function() {
            var $input = $(this);
            var $inputComponent = $input.closest('.cs-input');
            if (
                $inputComponent.hasClass('_required') ||
                $inputComponent.hasClass('required')
            ) {
                if (
                    $inputComponent.length &&
                    $input.attr('name') !== 'street[0]'
                ) {
                    $input.removeAttr('data-validate');
                }
            }

            // Init validation on every checkout field
            $input.validation();

            $input.on('blur change', function() {
                if ($input.validation('isValid') && $input.val() !== '') {
                    $inputComponent.addClass('cs-input--success');

                    if ($input.attr('name') === 'street[0]') {
                        if (!/\d/.test($input.val())) {
                            $inputComponent.addClass('cs-input--warning');
                            if (
                                !$input.next().hasClass('cs-input__warning') &&
                                !$('.cs-html-select--autosuggest').length
                            ) {
                                var missingStreetMessage =
                                    '<div class="cs-input__warning" >' +
                                    $.mage.__(
                                        'Do not forget about street number'
                                    ) +
                                    '</div>';

                                $input.after(missingStreetMessage);
                            }
                        } else {
                            $inputComponent
                                .removeClass('cs-input--warning')
                                .find('.cs-input__warning')
                                .remove();
                        }
                    }
                } else {
                    $inputComponent.removeClass('cs-input--success');
                }
            });
        });
        $shippingForm.validation();
    }

    /**
     * Initializes all of our customizations, invoked when checkout is fully loaded.
     */
    function onCheckoutLoaded() {
        var $shippingAddressForm = $('#co-shipping-form');

        initInlineValidation($shippingAddressForm);

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
