define([
    'jquery',
    'ko',
    'underscore',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_InventoryInStorePickupFrontend/js/model/pickup-locations-service',
    'Magento_Customer/js/model/address-list',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/checkout-data',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/model/quote',
], function (
    $,
    ko,
    _,
    shippingService,
    pickupLocationsService,
    addressList,
    selectShippingAddressAction,
    checkoutData,
    customer,
    quote
) {
    'use strict';

    return function (NextButton) {
        return NextButton.extend({
            // Need to import isStorePickupAvailable and isStorePickupSelected  to know when to disable "Next" button.
            // It should be disabled when StorePickup is selected as shipping method but no store has been chosen from the list of stores
            defaults: {
                isDisabled: false,
                isStorePickupSelectedSelf: ko.observable(false),
                isLocationSelected: ko.observable(false),
                pickInStoreButtonSelector:
                    '#checkout-step-store-selector [data-role="opc-continue"]',
                imports: {
                    isStorePickupAvailable:
                        'checkout.steps.store-pickup:isAvailable',
                    isStorePickupSelected:
                        'checkout.steps.store-pickup:isStorePickupSelected',
                },
                listens: {
                    isStorePickupSelected: 'updateStorePickupSelection',
                },
            },

            // isDisabled must become computed because it checks multiple observables now.
            // If StorePickup is availble and selected as shipping method then check for store selection (isLocationSelected).
            // If not, fallback to default logic
            // Additionally select default shipping address if for logged-in user their shipping address was unchecked while switching shipping/pick in-store tabs
            initialize: function () {
                this._super();

                this.isDisabled = ko.computed(function () {
                    if (
                        typeof this.isStorePickupAvailable === 'object' &&
                        this.isStorePickupAvailable !== null &&
                        this.isStorePickupSelectedSelf()
                    ) {
                        return !this.isLocationSelected();
                    }

                    if (
                        typeof this.isStorePickupAvailable === 'object' &&
                        this.isStorePickupAvailable !== null &&
                        !this.isStorePickupSelectedSelf()
                    ) {
                        if (customer.isLoggedIn()) {
                            var isAnyAddressSelected = false;
                            var quoteShippingAddressKey = quote
                                .shippingAddress()
                                .getKey();

                            if (addressList().length) {
                                _.each(addressList(), function (address) {
                                    if (
                                        quoteShippingAddressKey ==
                                        address.getKey()
                                    ) {
                                        isAnyAddressSelected = true;
                                    }
                                });

                                if (!isAnyAddressSelected) {
                                    var defaultShippingAddress = _.find(
                                        addressList(),
                                        function (address) {
                                            return address.isDefaultShipping();
                                        }
                                    );

                                    selectShippingAddressAction(
                                        defaultShippingAddress
                                    );
                                    checkoutData.setSelectedShippingAddress(
                                        defaultShippingAddress.getKey()
                                    );
                                }
                            }
                        }
                    }

                    return shippingService.isLoading();
                }, this);

                // Subscribe to location selection observable to make sure store is chosen
                pickupLocationsService.selectedLocation.subscribe(function (
                    storeData
                ) {
                    this.isLocationSelected(storeData !== null);
                },
                this);
            },

            // isStorePickupSelected has to be listened for changes.
            // Custom observable had to be created to synchronize  with isStorePickupSelected
            updateStorePickupSelection: function (isSelected) {
                this.isStorePickupSelectedSelf(isSelected);
            },

            // Modified to trigger click of the correct button because store pickup has dedicated "Next", different from the shipping form
            continueToPayment: function () {
                var $nextButton = this.isStorePickupSelectedSelf()
                    ? $(this.pickInStoreButtonSelector)
                    : $(this.nextButtonSelector);

                $nextButton.trigger('click');
            },
        });
    };
});
