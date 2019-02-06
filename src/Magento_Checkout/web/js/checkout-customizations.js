/**
 * Mount creativestyle customizations after step shipping of the checkout is loaded
 */
define([
    'rjsResolver',
    'jquery',
    'mage/validation',
    'bundle',
    'mage/translate',
], function(resolver, $, validation, bundle) {
    'use strict';

    /**
     * Makes sure our custom next buttons trigger originals properly.
     */

    function handleCustomNextButtons() {
        var $customNextButtons = $('.cs-checkout-button-next');
        // ID of a form that has hidden button
        var $formWithHiddenNextButton = $('#co-shipping-method-form');
        if ($customNextButtons.length) {
            $customNextButtons.on('click', function() {
                if ($formWithHiddenNextButton.length) {
                    $formWithHiddenNextButton.submit();
                } else {
                    $('#co-shipping-method-form').submit();
                }
            });
        }
    }

    /**
     * Makes sure our custom order button gets proper state depending on
     * selected payment methods and triggers original order buttons properly.
     */
    function handleCustomOrderButtons() {
        var $customPlaceOrderButtons = $('.cs-place-order-button');
        var $checkoutPaymentMethods = $('#checkout-payment-method-load');
        /**
         * Function that toggles place order button disabled state depending
         * on original button's state.
         */
        var togglePlaceOrderButton = function() {
            var $origPlaceOrderButton = $(
                '.payment-method._active .action.checkout[type="submit"]'
            );
            if ($origPlaceOrderButton.is(':not(disabled):not(".disabled")')) {
                $customPlaceOrderButtons.prop('disabled', false);
            } else {
                $customPlaceOrderButtons.prop('disabled', true);
            }
        };
        // We need to call it on init in case someone got directly to payment step.
        togglePlaceOrderButton();
        // And on any payment methods changes.
        $checkoutPaymentMethods.on('click change', togglePlaceOrderButton);

        $customPlaceOrderButtons.on('click', function() {
            var $origPlaceOrderButton = $(
                '.payment-method._active .action.checkout[type="submit"]'
            );
            if ($origPlaceOrderButton.is(':not(disabled):not(".disabled")')) {
                $origPlaceOrderButton.trigger('click');
            }
        });
    }

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

                    if ($input.attr('name') == 'street[0]') {
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
        handleCustomNextButtons();
        handleCustomOrderButtons();

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
