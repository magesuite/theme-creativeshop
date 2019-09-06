require([
    'jquery',
    'underscore',
    'jquery/ui',
    'Magento_Ui/js/modal/modal',
    'mage/translate',
    'Magento_Ui/js/lib/validation/utils',
    'Magento_Ui/js/form/element/abstract',
    'Magento_Ui/js/lib/validation/validator',
    'Magento_Customer/js/model/customer/address'
], function ($, _, ui, modal, $t, utils, abstract, validator, customerAddress) {
    'use strict';

    var repertus_packstation_address_types = {
        ADDRESS_TYPE_UNDEFINED: '',
        ADDRESS_TYPE_MAILING: '0',
        ADDRESS_TYPE_POST: '1',
        ADDRESS_TYPE_PACKSTATION: '2'
    };

    var repertus_packstation_types = {
        PACKSTATION_TYPE_UNDEFINED: '',
        PACKSTATION_TYPE_PACKSTATION: 'P',
        PACKSTATION_TYPE_POSTFILIALE: 'F'
    };

    var repertus_packstation_labels = {
        company2_label_def: $t('Company'),
        company2_label_customerno: $t('DHL Customer no.'),
        street2_label_def: $t('Street'),
        street2_label_no: $t('Stationnumber*'),
        street2_val_packstation: $t('Packstation'),
        street2_val_postfiliale: $t('Post office'),
        streetnumber_only_placeholder: $t('Nr.*'),
        select_action: $t('Accept as shipping address'),
        country_germany: $t('Germany')
    };

    var repertus_postnumber_is_mandatory = true,
        repertus_shipping_address_type = '0';

    /* ************************************************************************************************************** */

    /**
     * @param options
     * @returns {*}
     */
    $.fn.repertusPackstation = function(options) {
        var defaults = {
            parentCls: 'fieldset.repertus_address_type_fieldset',
            searchButtonCls: '.repertus_packstation--search-button',
            modalCls: '.repertus_packstation--search-modal',
            formCls: '.form-address-edit',
            formId: '#form-validate',
            selectorCls: '',
            addAdditionalFields: true,
            requiredCls: 'required'
        };

        return $(this).each(function () {
            new $.RepertusPackstation($(this), $.extend({}, defaults, options));
        });
    };

    /* ************************************************************************************************************** */

    /**
     * @param control
     * @param options
     * @constructor
     */
    $.RepertusPackstation = function (control, options) {
        var me = this;

        me.control = control;
        me.options = options;

        me.init();
    };

    $.RepertusPackstation.prototype = {
        control: null,
        options: null,
        modal: null,
        map: null,
        form: null,
        selector: null,

        init: function () {
            var me = this,
                btn = me.control.find(me.options.searchButtonCls),
                formIdentifier = 'form';

            formIdentifier += me.options.formId.length > 0 ? me.options.formId : '';
            formIdentifier += me.options.formCls.length > 0 ? me.options.formCls : '';

            me.form = me.control.closest(me.options.parentCls).find(formIdentifier);

            if (me.options.addAdditionalFields) {
                me.initAdditionalFormFields();
            }

            var numberInput = me.form.find('.field.field-repertus-number input'),
                postNumberInput = me.form.find('.field.field-repertus-postnumber input');

            me.initModal();
            me.initSelector();

            numberInput.on('change', $.proxy(me.onNumberChange, me));
            postNumberInput.on('change', $.proxy(me.onPostNumberChange, me));
            btn.on('click', $.proxy(me.onSearchButtonClick, me));

            me.addValidationRules();
        },

        addValidationRules: function () {
            var me = this;

            validator.addRule(
                'validate-post-number',
                $.proxy(me.validatePostNumber, me),
                $t("A valid Post Number is required when shipping to a Packstation")
            );

            validator.addRule(
                'validate-station-number',
                $.proxy(me.validateStationNumber, me),
                $t("Required when shipping to a Packstation or Post Office")
            );
        },

        validatePostNumber: function (value) {
            var me = this,
                isPackstationSelected = me.selector !== null && parseInt(me.selector.val()) === 2,
                isPostNumberEmpty = value.length <= 0;

            return isPackstationSelected ? !isPostNumberEmpty : true;
        },

        validateStationNumber: function (value) {
            var me = this,
                isPostAddressSelected = me.selector !== null && parseInt(me.selector.val()) === 0,
                isStationNumberEmpty = value.length <= 0;

            return isPostAddressSelected || (!isPostAddressSelected && !isStationNumberEmpty);
        },

        initAdditionalFormFields: function () {
            var me = this,
                fieldSet = me.control.closest('fieldset.repertus_address_type_fieldset'),
                currentPostNumber = fieldSet ? fieldSet.data('repertus-post-number') : '',
                currentStationNumber = fieldSet ? fieldSet.data('repertus-station-number') : '',
                postNumberField = $('<div class="cs-input | cs-form__field | field | field-repertus-postnumber">' +
                    '<label class="cs-input__label" for="repertus_post_number"><span>' + $.mage.__('Post Number') + '</span></label>' +
                    '<div class="cs-input__control">' +
                        '<input type="text" id="repertus_post_number" name="repertus_post_number" value="' + currentPostNumber + '" title="'+ $.mage.__('Post Number') + '" ' +
                            'class="cs-input__input required-entry" data-validate="{required:false}" aria-required="false">' +
                    '</div></div>'),
                numberField = $('<div class="cs-input | cs-form__field | field | field-repertus-number">' +
                    '<label class="cs-input__label" for="repertus_number"><span>' + $.mage.__('Packstation No.') + '</span></label>' +
                    '<div class="cs-input__control">' +
                    '<input type="text" id="repertus_number" name="repertus_number" value="' + currentStationNumber + '" title="' + $.mage.__('Packstation No.') + '" ' +
                    'class="cs-input__input required-entry" data-validate="{required:false}" aria-required="false">' +
                    '</div></div>');

            me.form.find('.field.company').after(postNumberField);
            me.form.find('.field.street').after(numberField);
        },

        initModal: function() {
            var me = this;

            me.modal = me.control.closest(me.options.parentCls).find(me.options.modalCls);
            me.modal.modal({
                title: $.mage.__(me.modal.data('modal-title')),
                modalClass: 'repertus_packstation-modal',
                responsive: true
            })
        },

        initMap: function () {
            var me = this;

            me.map = me.modal.find("#tonur_packstation_map");
            me.map.tonurPackstationMap(me.modal, {
                form: me.form,
                selector: me.selector,
                requiredCls: me.options.requiredCls,
                searchUrl: me.modal.data('modal-search-url')
            });
        },

        initSelector: function () {
            var me = this;

            me.selector = me.control.find(me.options.selectorCls + ' select');
            me.selector.tonurPackstationSelector(me.form, me.options);
        },

        onSearchButtonClick: function(event) {
            var me = this;

            event.stopPropagation();
            event.preventDefault();

            me.initMap();
            me.modal.modal('openModal');
        },

        onNumberChange: function () {
            var me = this,
                addressTypeSelect = me.selector,
                addressTypeValue = addressTypeSelect ? addressTypeSelect.val() : null,
                addressTypeText = addressTypeSelect ? addressTypeSelect.find('option:selected').text() : null,
                streetInput = me.form.find('.field.street input'),
                numberInput = me.form.find('.field.field-repertus-number input'),
                postNumberInput = me.form.find('.field.field-repertus-postnumber input'),
                postNumberValue = postNumberInput ? postNumberInput.val() : null,
                numberValue = numberInput ? numberInput.val() : null;

            if (numberValue.length > 0) {
                switch (addressTypeValue) {
                    case '1':
                        addressTypeText = ($.mage.__('Post Office No.'));
                        break;
                    case '2':
                        addressTypeText = ($.mage.__('Packstation No.'));
                        break;
                }

                if (addressTypeValue  > 0)
                {
                    if (postNumberValue.length > 0)
                    {
                        streetInput.last().val(addressTypeText + ' ' + numberValue);
                        streetInput.last().trigger('change');
                    } else {
                        streetInput.first().val(addressTypeText + ' ' + numberValue);
                        streetInput.first().trigger('change');
                        streetInput.last().val('');
                    }
                }
            }
        },

        onPostNumberChange: function() {
            var me = this,
                addressTypeSelect = me.selector,
                addressTypeValue = addressTypeSelect ? parseInt(addressTypeSelect.val()) : null,
                streetInput = me.form.find('.field.street input'),
                numberInput = me.form.find('.field.field-repertus-number input'),
                postNumberInput = me.form.find('.field.field-repertus-postnumber input'),
                postNumberValue = postNumberInput ? postNumberInput.val() : null;

            if (postNumberValue.length > 0) {
                switch (addressTypeValue) {
                    case 1:
                    case 2:
                        streetInput.first().val(postNumberValue);
                        streetInput.first().trigger('change');
                        break;
                }
            }

            numberInput.trigger('change');
        }

    };

    /* ************************************************************************************************************** */

    $.fn.tonurPackstationMap = function (modal, options) {
        this.each(function () {
            var tonurPackstationMap = Object.create($.tonurPackstationMap);

            tonurPackstationMap.init(this, $('#repertus_find_packstation_button_execute'), modal, options);
        });
    };

    $.tonurPackstationMap = {
        form: null,
        selector: null,
        searchUrl: 'http://dev.magento.de/magento/213/repertus_packstation/packstation/search',
        tonur_shipping_packstation_labels : {
            select_action: $.mage.__("Accept as shipping address"),
            street2_val_packstation: $.mage.__("Packstation"),
            street2_val_postfiliale: $.mage.__("Post Office")
        },
        map: null,
        target: null,
        address: {
            zipcode: null,
            city: null,

            isDefined: function () {
                var city = this.city.trim(),
                    zipcode = this.zipcode.trim(),
                    matchBad = /^[0-9]{5}$/;

                if (!matchBad.test(zipcode)) {
                    $("#packstation_zipcode").addClass("has--error");
                    return false;
                }

                return (city != null && zipcode != null &&
                city.length > 0 && zipcode.length > 0);
            }
        },
        formFieldSelectors: {
            zip: 'input[name=postcode]',
            city: 'input[name=city]',
            street: '.field.street input'
        },

        readAddressFromRegisterForm: function () {
            var me = this,
                zipcode = $(me.formFieldSelectors.zip),
                city = $(me.formFieldSelectors.city);

            me.address.zipcode = zipcode.val();
            me.address.city = city.val();
        },

        readAddressFromSearchForm: function () {
            var me = this,
                zipcode = $("input[id=packstation_zipcode]"),
                city = $("input[id=packstation_city]");

            me.address.zipcode = zipcode.val().trim();
            me.address.city = city.val().trim();
        },

        storeAddressToSearchForm: function () {
            var me = this,
                zipcode = $("input[id=packstation_zipcode]"),
                city = $("input[id=packstation_city]");

            zipcode.val(me.address.zipcode);
            city.val(me.address.city);
        },

        storeDeliveryAddress: function (address, type, number) {
            var me = this,
                p = Object.create($.tonurPackstation);

            p.init(me.selector, me.form, me.options);
            p.setAddressType(type === "P" ? repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION : repertus_packstation_address_types.ADDRESS_TYPE_POST);
            p.setCountryToGermany(true);
            p.setAddressData(address, number);

            me.focusShippingAddress();
        },

        focusShippingAddress: function () {
            var me = this,
                shippingAddress1 = $('.register--shipping'),
                shippingAddress2 = $('#shippingAddress'),
                shippingAddress3 = $('.account--address'),
                shippingAddress4 = $('.alternative_shipping');
            var offset = null;

            if (shippingAddress1.length === 1) {
                offset = shippingAddress1.offset();
            }
            else if (shippingAddress2.length === 1) {
                offset = shippingAddress2.offset();
            }
            else if (shippingAddress3.length === 1) {
                offset = shippingAddress3.offset();
            }
            else if (shippingAddress4.length === 1) {
                offset = shippingAddress4.offset();
            }

            if (offset !== null) {
                offset.left -= 20;
                offset.top -= 20;

                $('html, body').animate({
                    scrollTop: offset.top,
                    scrollLeft: offset.left
                }, 'fast');
            }

            me.map.dispose();

            if (me.modal !== null) {
                me.modal.modal('closeModal');
            }
        },

        init: function (container, button, modal, options) {
            var me = this;

            me.modal = modal;
            me.form = options.form;
            me.selector = options.selector;
            me.options = options;

            me.searchUrl = me.options.searchUrl || me.form.find('#repertus_find_packstation_button').data('modal-search-url');

            me.readAddressFromRegisterForm();
            me.storeAddressToSearchForm();

            setTimeout(function () {
                me.map = new Microsoft.Maps.Map(container,
                    {
                        credentials: 'ApCsSSuu6NMf6ovQE9Q9i74-JdFhiHObBMnWBIZ07qX_Us3pXUEiRpt__nWQqjfT',
                        enableSearchLogo: false,
                        enableClickableLogo: false,
                        showDashboard: false,
                        showMapTypeSelector: false,
                        showScalebar: false,
                        zoom: 13
                    });
                me.search();
            }, 500);


            button.click(function () {
                me.search();
            });

            var handler = function (event) {

                var keycode = (event.keyCode ? event.keyCode : event.which);
                if (keycode === 13) {
                    me.search();
                }

            };

            $('#packstation_zipcode').on('keypress', handler);
            $('#packstation_city').on('keypress', handler);
        },

        packstationSelected: function (target) {
            var me = this;

            me.storeDeliveryAddress(target.data_address, target.data_type, target.data_number);
        },

        search: function () {
            var me = this;

            me.readAddressFromSearchForm();
            if (!me.address.isDefined()) {
                var zipCode = $('#packstation_zipcode'),
                    city = $('#packstation_city');

                if (zipCode.val().length === 0) {
                    zipCode.focus();
                }
                else if (city.val().length === 0) {
                    city.focus();
                }

                return;
            }

            $('#tonur_packstation_map_frame').addClass('busy');
            $('#tonur_packstation_error_alert').removeClass('error');
            $("#packstation_zipcode").removeClass("has--error");
            $.ajax({
                'url': me.searchUrl,
                'dataType': 'json',
                'type': 'POST',
                'data': {
                    'street': me.address.street,
                    'streetnumber': me.address.streetnumber,
                    'zipcode': me.address.zipcode,
                    'city': me.address.city
                },

                'done': function () {
                },

                'error': function (request, type, errorThrown) {
                    me.map.setView({center: new Microsoft.Maps.Location(0, 0)});
                    $('#tonur_packstation_map_frame').removeClass('busy');

                    $('#tonur_packstation_error_alert').addClass('error');
                },

                'success': function (result) {
                    var stations = result['packstations'];
                    var first = true;

                    if (stations == null) {
                        me.map.setView({center: new Microsoft.Maps.Location(0, 0)});
                        $('#tonur_packstation_map_frame').removeClass('busy');

                        $('#tonur_packstation_error_alert').addClass('error');
                    }

                    var infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0),
                        {
                            visible: false,
                            offset: new Microsoft.Maps.Point(10, 20),
                            height: 110,
                            width: 250,
                            showCloseButton: true,
                            zIndex: 99,
                            actions: [
                                {
                                    label: me.tonur_shipping_packstation_labels.select_action,
                                    eventHandler: function () {
                                        me.packstationSelected(me.target);
                                    }
                                }
                            ]
                        });

                    me.map.entities.clear();

                    $(stations).each(function () {
                        var pin = new Microsoft.Maps.Pushpin(
                            new Microsoft.Maps.Location(this.location.latitude, this.location.longitude));

                        Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                            me.map.setView({center: pin.getLocation()});
                        });

                        if (first) {
                            first = false;
                            me.map.setView({center: new Microsoft.Maps.Location(this.location.latitude, this.location.longitude)});
                        }

                        if (this.automatType === 4) {
                            // Packstation
                            pin.title = me.tonur_shipping_packstation_labels.street2_val_packstation + ' ' + this.packstationId;
                            pin.description = this.address.street + ' ' + (this.address.streetNo != null ? this.address.streetNo : '') + '<br/>' + this.address.zip + ' ' + this.address.city;
                            pin.data_number = this.packstationId;
                            pin.data_address = this.address;
                            pin.data_type = 'P';
                        }
                        else if (this.automatType === 30) {
                            // Postfiliale
                            //noinspection JSUnresolvedVariable
                            pin.title = me.tonur_shipping_packstation_labels.street2_val_postfiliale + ' ' + this.depotServiceNo;
                            //noinspection JSUnresolvedVariable
                            pin.description = this.address.street + ' ' + this.address.streetNo + '<br/>' + this.address.zip + ' ' + this.address.city;
                            //noinspection JSUnresolvedVariable
                            pin.data_number = this.depotServiceNo;
                            pin.data_address = this.address;
                            pin.data_type = 'F';
                        }

                        me.map.entities.push(pin);

                        var handler = function (e) {
                            //noinspection JSUnresolvedVariable
                            if (e.targetType === 'pushpin') {
                                var location = e.target.getLocation();

                                me.target = e.target;

                                infobox.setLocation(location);
                                infobox.setOptions(
                                    {
                                        visible: true,
                                        title: e.target.title,
                                        description: e.target.description
                                    }
                                );
                            }
                        };

                        Microsoft.Maps.Events.addHandler(pin, 'click', handler);
                        Microsoft.Maps.Events.addHandler(pin, 'mouseover', handler);
                    });

                    me.map.entities.push(infobox);
                    $('#tonur_packstation_map_frame').removeClass('busy');
                }
            });
        }
    };

    /* ************************************************************************************************************** */

    $.fn.tonurPackstationSelector = function (form, options) {
        var p = Object.create($.tonurPackstation);

        p.init($(this), form, options);

        var selectBox = $(this),
            isInitialValue = selectBox.val() === repertus_packstation_address_types.ADDRESS_TYPE_MAILING;

        repertus_shipping_address_type = !isInitialValue ? selectBox.val() : repertus_packstation_address_types.ADDRESS_TYPE_MAILING;

        $(this).change(function (e, force) {
            e.preventDefault();

            repertus_shipping_address_type = $(this).val();

            p.updateView(force);
        });

        if (this.length > 0) {
            var street2 = $("input#street2"),
                street2_val = street2.length > 0 ? street2.val() : '';

            switch (repertus_shipping_address_type) {
                case repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION:
                    p.setAddressType(repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION);
                    break;
                case repertus_packstation_address_types.ADDRESS_TYPE_POST:
                    p.setAddressType(repertus_packstation_address_types.ADDRESS_TYPE_POST);
                    break;
                default:
                    var ix = street2_val.indexOf(' '),
                        number = ix > 0 ? street2_val.substring(ix).trim() : '';

                    if (street2_val.indexOf(repertus_packstation_labels.street2_val_packstation) === 0) {
                        p.setAddressType(
                            repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION,
                            repertus_packstation_types.PACKSTATION_TYPE_PACKSTATION);
                        $("#streetnumber2").val(number);
                    }
                    else if (street2_val.indexOf(repertus_packstation_labels.street2_val_postfiliale) === 0) {
                        p.setAddressType(
                            repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION,
                            repertus_packstation_types.PACKSTATION_TYPE_POSTFILIALE);
                        $("#streetnumber2").val(number);

                    }
                    else {
                        p.setAddressType(repertus_packstation_address_types.ADDRESS_TYPE_MAILING);
                    }
            }
        }
    };

    /* ************************************************************************************************************** */

    $.fn.tonurPackstationNumberValidator = function () {

        this.blur(function (e) {
            e.preventDefault();
            var p = Object.create($.tonurPackstation);
            p.validateNumber(true, true);
        });
    };

    /* ************************************************************************************************************** */

    $.fn.tonurPackstationSelectorChange = function () {
        var p = Object.create($.tonurPackstation, {
        });

        this.change(function () {
            var v = $(this).val();

            if (repertus_shipping_address_type === repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION) {
                p.setStreetValue(v);
                p.validateNumber(false);
            }
        });
    };

    /* ************************************************************************************************************** */

    $.tonurPackstation = {
        selector: null,
        form: null,
        fieldSelectors: {
            zip: 'input[name=postcode]',
            city: 'input[name=city]',
            street: '.field.street input',
            number: '.field.field-repertus-number input'
        },
        options: {
            requiredCls: '_required'
        },

        init: function (selector, form, options) {
            var me = this;

            me.selector = selector;
            me.form = form;
            me.options = $.extend({}, me.options, options);

            me.updateView();
        },

        setAddressType: function (type) {
            var me = this,
                selectBox = me.selector;

            selectBox.val(type);
            selectBox.trigger("change", true);
        },

        setStreetValue: function (value) {
            var street2_input = $("#street2");

            street2_input.val(value);
            street2_input.attr("value", value);
        },

        setStreetToNull: function () {
            var me = this;

            me.setStreetValue('');
        },

        enableOrDisableOtherCountries: function (select, country, disable) {
            var options = select.find('options');

            options.each(function (elem) {
                if (elem.val() !== country) {
                    if(disable) {
                        elem.attr('disabled', 'disabled')
                    } else {
                        elem.removeAttr('disabled')
                    }
                }
            });
        },

        setCountryToGermany: function (disableOthers) {
            var me = this,
                countrySelect = me.form.find('.field select[name=country_id]');

            countrySelect.val('DE');
            countrySelect.trigger('change');

            me.enableOrDisableOtherCountries(countrySelect, 'DE', disableOthers);
        },

        setAddressData: function (addressData, number)
        {
            var me = this,
                zipInput = me.form.find(me.fieldSelectors.zip),
                cityInput = me.form.find(me.fieldSelectors.city),
                numberInput = me.form.find(me.fieldSelectors.number);

            zipInput.val(addressData.zip);
            cityInput.val(addressData.city);
            numberInput.val(number);

            cityInput.trigger('change');
            zipInput.trigger('change');
            numberInput.trigger('change');
        },

        getPackstationType: function () {
            if (repertus_shipping_address_type === repertus_packstation_address_types.ADDRESS_TYPE_POST) {
                return repertus_packstation_types.PACKSTATION_TYPE_UNDEFINED;
            }

            var me = this,
                select = me.form.find('.field.repertus_address_type_field select'),
                selectedOption = select? select.find("option:selected") : null,
                optionValue = selectedOption ? selectedOption.val() : null;

            switch (optionValue) {
                case 1:
                    return repertus_packstation_types.PACKSTATION_TYPE_PACKSTATION;

                case 2:
                    return repertus_packstation_types.PACKSTATION_TYPE_POSTFILIALE;

                default:
                    return repertus_packstation_types.PACKSTATION_TYPE_UNDEFINED;
            }
        },

        isShippingAddressActive: function () {
            var shippingAddressToggle = $("#register_billing_shippingAddress");
            return shippingAddressToggle.length === 0 || shippingAddressToggle[0].checked;
        },

        updateView: function () {
            var me = this,
                numberInput = me.form.find('.field.field-repertus-number input'),
                countrySelect =  me.form.find('.field select[name=country_id]');

            numberInput.trigger('change');

            me.enableOrDisableOtherCountries(countrySelect, 'DE', false);
            me.showOrHideFields();
        },

        showOrHideFields: function () {
            var me = this,
                selectValue = me.selector ? me.selector.val() : null,
                isMailingAddress = selectValue === repertus_packstation_address_types.ADDRESS_TYPE_MAILING,
                isPackstation = selectValue === repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION,
                isPostOffice = selectValue === repertus_packstation_address_types.ADDRESS_TYPE_POST,
                postNumberField = me.form ? me.form.find('.field.field-repertus-postnumber') : null,
                numberField = me.form ? me.form.find('.field.field-repertus-number') : null,
                numberFieldLabel = numberField ? numberField.find('label span') : null,
                streetField = me.form ? me.form.find('.field.street') : null,
                defaultBillingAddressCheckbox = me.form.find(".field.choice.set.billing");

            if (isMailingAddress) {
                postNumberField.hide();
                numberField.hide();

                postNumberField.removeClass(me.options.requiredCls);
                postNumberField.find('input').removeClass('required-entry');

                numberField.removeClass(me.options.requiredCls);
                numberField.find('input').removeClass('required-entry');

                defaultBillingAddressCheckbox.show();

                streetField.show();
            }

            if (isPackstation || isPostOffice)
            {
                numberField.addClass(me.options.requiredCls);
                numberField.find('input').addClass('required-entry');

                if (isPostOffice) {
                    numberFieldLabel.text($.mage.__('Post Office No.'));
                    postNumberField.removeClass(me.options.requiredCls);
                    postNumberField.find('input').removeClass('required-entry');
                } else {
                    numberFieldLabel.text($.mage.__('Packstation No.'));
                    postNumberField.addClass(me.options.requiredCls);
                    postNumberField.find('input').addClass('required-entry');
                    postNumberField.find('input').addClass('validate-post-number');
                }

                postNumberField.show();
                numberField.show();

                defaultBillingAddressCheckbox.hide();

                streetField.hide();
            }
        },

        validateNumber: function (force, showSuccess) {
            var me = this;

            if (!me.isShippingAddressActive()) {
                return;
            }

            var valid = true,
                company2_input = $("#company2"),
                country2 = $('#country_shipping'),
                street2_input = $("#street2");

            if(country2.length === 0){
                country2 = $('#country');
            }

            if(company2_input.length === 0){
                company2_input = $('#company');
            }

            var post_number = company2_input.val(),
                post_number_length = post_number.length;

            if (repertus_shipping_address_type === repertus_packstation_address_types.ADDRESS_TYPE_PACKSTATION
                && (me.getPackstationType() === repertus_packstation_types.PACKSTATION_TYPE_PACKSTATION
                || me.getPackstationType() === repertus_packstation_types.PACKSTATION_TYPE_POSTFILIALE)) {

                if (repertus_postnumber_is_mandatory || post_number_length > 0) {
                    valid &= !isNaN(post_number);
                    valid &= (post_number_length >= 6 && post_number_length <= 12);
                }
            }

            if (valid) {
                company2_input.removeClass('has--error');
                country2.removeClass('has--error');

                if (showSuccess && post_number_length > 0) {
                    company2_input.addClass('is--success');
                }
            } else {
                street2_input.removeClass('has--error');
                company2_input.removeClass('is--success');
                me.setStreetToNull();

                if (force || post_number_length > 0) {
                    company2_input.addClass('has--error');
                }
            }
        }
    };

    /* ************************************************************************************************************** */
    /* JS has been overwritten because of changes in lines:
     * - 153-164 - inputs custom classes,
     * - 175 - title translation,
     * - 901 - parentCls,
    */ 

    $(document).ready(function () {
        var addressTypeField = $('.field.repertus_address_type');

        addressTypeField.repertusPackstation({
            parentCls: '.cs-dashboard__main',
            addAdditionalFields: addressTypeField.hasClass('repertus_address_type--add-fields'),
            requiredCls: 'required'
        });
    });
});
