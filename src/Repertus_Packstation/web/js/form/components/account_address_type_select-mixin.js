define(['jquery'], function ($) {
    'use strict';

    var mixin = {
        initialize: function () {
            this._super();

            // If address is already filled with Packstation or Post Office address, set proper address type
            this.updateAddressType();

            return this;
        },
        updateAddressType: function() {
            var streetValue = this.$street1Field.val();

            if (streetValue) {
                var postNumber = streetValue.match(/(\d+)/)[0];

                if (this.isAdressPackstation(streetValue)) {
                    var postNumberValue = this.$street2Field.val();

                    this.setAddressType(this.address_types.ADDRESS_TYPE_PACKSTATION)
                    this.setPackstationValue(postNumber);
                    this.setPostNumberValue(postNumberValue);
                }

                if (this.isAdressPostOffice(streetValue)) {
                    this.setAddressType(this.address_types.ADDRESS_TYPE_POST);
                    this.setPackstationValue(postNumber);
                }
            }
        },
        initAdditionalFormFields: function () {
            var currentPostNumber = this.$addressTypeFieldSet ? this.$addressTypeFieldSet.data('repertus-post-number') : '',
                currentStationNumber = this.$addressTypeFieldSet ? this.$addressTypeFieldSet.data('repertus-station-number') : '',
                postNumberField = $('<div class="cs-input cs-form__field | field field-repertus-postnumber">' +
                    '<label class="cs-input__label" for="repertus_post_number"><span>' + $.mage.__('Post Number') + '</span></label>' +
                    '<div class="cs-input__control">' +
                    '<input type="text" id="repertus_post_number" name="repertus_post_number" value="' + currentPostNumber + '" title="'+ $.mage.__('Post Number') + '" ' +
                    'class="cs-input__input required-entry" data-validate="{required:false}" aria-required="false">' +
                    '</div></div>'),
                numberField = $('<div class="cs-input cs-form__field | field field-repertus-number">' +
                    '<label class="cs-input__label" for="repertus_number"><span>' + $.mage.__('Packstation No.') + '</span></label>' +
                    '<div class="cs-input__control">' +
                    '<input type="text" id="repertus_number" name="repertus_number" value="' + currentStationNumber + '" title="' + $.mage.__('Packstation No.') + '" ' +
                    'class="cs-input__input required-entry" data-validate="{required:false}" aria-required="false">' +
                    '</div></div>');

            this.$form.find('.field.company').after(postNumberField);
            this.$streetFieldSet.after(numberField);
        },
    };

    return function (target) {
        return target.extend(mixin);
    };
});
