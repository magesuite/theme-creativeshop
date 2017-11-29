/**
 * Mount creativestyle customizations after step shipping of the checkout is loaded
 */
define(['rjsResolver', 'jquery', 'mage/validation', 'mage/translate', 'bundle'], function(
    resolver,
    $,
    validation,
    $translate,
    bundle
) {
    'use strict';

    /**
     * Makes sure our custom next buttons trigger originals properly.
     */

    function handleCustomNextButtons() {
        var $customNextButtons = $('.cs-checkout-button-next');
        // ID of a form that has hidden button
        var $formWithHiddenNextButton = $('#co-shipping-method-form');
        if ($customNextButtons.length) {
            // Probably there is a problem with: data-bind="css: { 'cs-no-display': isHidden() }" in
            // next-button.html. In some percentages is isPayment is triggered on is Shipping
            $('.cs-checkout__sidebar-bottom').removeClass('cs-no-display');

            $customNextButtons.on('click', function() {
                $formWithHiddenNextButton.submit();
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

        $checkoutPaymentMethods.on('click change', function() {
            var $origPlaceOrderButton = $(
                '.payment-method._active .cs-button-payment-method[type="submit"]'
            );
            if ($origPlaceOrderButton.is(':not(disabled):not(".disabled")')) {
                $customPlaceOrderButtons.prop('disabled', false);
            } else {
                $customPlaceOrderButtons.prop('disabled', true);
            }
        });

        $customPlaceOrderButtons.on('click', function() {
            var $origPlaceOrderButton = $(
                '.payment-method._active .cs-button-payment-method[type="submit"]'
            );
            if ($origPlaceOrderButton.is(':not(disabled):not(".disabled")')) {
                $origPlaceOrderButton.trigger('click');
            }
        });
    }

    /**
     * Sets custom classes for address fields for styling purposes.
     */
    function setZipCityFields() {
        $('input[name="postcode"]')
            .closest('.cs-form__field')
            .addClass('cs-form__field--type_zip');
        $('input[name="city"]')
            .closest('.cs-form__field')
            .addClass('cs-form__field--type_city');
    }

    /**
     * Sets custom classes for personal information fields for styling purposes.
     */
    function setPersonFields() {
        $('select[name="prefix"]')
            .closest('.cs-form__field')
            .addClass('cs-form__field--type_prefix');
        $('input[name="firstname"]')
            .closest('.cs-form__field')
            .addClass('cs-form__field--type_firstname');
        $('input[name="lastname"]')
            .closest('.cs-form__field')
            .addClass('cs-form__field--type_lastname');
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
                                $input.after(
                                    '<div class="cs-input__warning" >' +
                                        $translate(
                                            'Do not forget about your house number.'
                                        ) +
                                        '</div>'
                                );
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

        setZipCityFields();
        setPersonFields();
        initInlineValidation($shippingAddressForm);
        handleCustomNextButtons();
        handleCustomOrderButtons();

        bundle.AddressAutofill({
            streetField: $shippingAddressForm.find('input[name="street[0]"]'),
            zipField: $shippingAddressForm.find('input[name="postcode"]'),
            cityField: $shippingAddressForm.find('input[name="city"]'),
            countrySelect: $shippingAddressForm.find(
                'select[name="country_id"]'
            ),
        });
    }

    /**
     * Initializes assets loading process listener.
     */
    function init() {
        resolver(onCheckoutLoaded);
    }

    return init;
});
