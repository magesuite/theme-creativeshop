import bundle from 'bundle';
import $ from 'jquery';
import $translate from 'mage/translate';

// Google address(geocode) API returns address with zip-code but query has to be specific - there is street and house number needed
import GoogleAddressDetector from '../google-address-detector/google-address-detector';

// Google place API returns places based on string. It will not return zip-code but query can be vague
import GooglePlaceDetector from '../google-place-detector/google-place-detector';

export interface IAddressAutofillOptions {
    streetField: JQuery;
    numberField?: JQuery;
    zipField: JQuery;
    cityField: JQuery;
    countrySelect?: JQuery;
    language: string;
    region: string;
    apiKey: string;
    dev: boolean;
}

export default class AddressAutofill {
    constructor(options: IAddressAutofillOptions) {
        this.streetField = options.streetField;
        this.numberField = options.numberField;
        this.zipField = options.zipField;
        this.cityField = options.cityField;
        this.countrySelect = options.countrySelect;
        this.options = options;

        this.detectorType = '';
        this.optionsList = '';

        $.getJSON('https://freegeoip.net/json/', (location: any): void => {
            if (location.countryCode) {
                options.region = location.countryCode;
                this.countrySelect.val(location.countryCode).change();
            }
        }).always(() => {
            // The most important parameter to set googleDetector region option and language option is value of country select
            if (this.countrySelect.val() !== options.region) {
                options.region = this.countrySelect.val();
            }

            options.language =
                this.countrySelect.val() ||
                window.navigator.userLanguage ||
                window.navigator.language;

            // Two detectors will be used based on level of query specificity
            this.googleAddressDetector = new GoogleAddressDetector(options);
            this.googlePlaceDetector = new GooglePlaceDetector(options);

            this._initStreetField();
            this._initZipField();
            this._watchSelect();
        });
    }

    /**
     * On keyup ( but not arrows, enter, back ) trigger address autofill based on street field value
     * @private
     */
    private _initStreetField(): void {
        let typeTimer: any;
        const typeInterval: number = 500;

        this.streetField.on('keyup', (e: KeyboardEvent): void => {
            clearTimeout(typeTimer);

            if (
                e.which !== 8 &&
                e.which !== 38 &&
                e.which !== 40 &&
                e.which !== 13
            ) {
                typeTimer = setTimeout(
                    this._initGoogleStreetRequest.bind(this),
                    typeInterval
                );
            }
        });
    }

    /**
     * Send request to google api based on street value. Use either places or address API based on query specificity
     * @private
     */
    private _initGoogleStreetRequest(): void {
        const query: string = this.streetField.val();

        if (!query || query.lenght < 4) {
            return;
        }

        if (this._detectHouseNr(query)) {
            this.detectorType = 'address';
            this.googleAddressDetector.getResults(query).then((data: any) => {
                if (data) {
                    this._buildAutosuggestSelect(data);
                }
            });
        } else {
            this.detectorType = 'place';
            this.googlePlaceDetector.getResults(query).then((data: any) => {
                if (data) {
                    this._buildAutosuggestSelect(data);
                }
            });
        }
    }

    /**
     * Trigger city autofill based on zip
     * @private
     */
    private _initGoogleZipRequest(): void {
        const query: string = this.zipField.val();

        if (!query || query.lenght < 3) {
            return;
        }

        this.googleAddressDetector
            .getCityByPostalCode(query)
            .then((data: any) => {
                if (data) {
                    this.cityField.val(data, query).change().focus();
                }
            });
    }

    /**
     * Send request to google api based on zip value
     * @private
     */
    private _initZipField(): void {
        let typeTimer: any;
        const typeInterval: number = 1000;

        this.zipField.on('keyup', (): void => {
            if (!this.cityField.val()) {
                clearTimeout(typeTimer);
                this.detectorType = 'address';
                typeTimer = setTimeout(
                    this._initGoogleZipRequest.bind(this),
                    typeInterval
                );
            }
        });

        this.zipField.on('blur', (): void => {
            if (!this.cityField.val()) {
                this._initGoogleZipRequest();
                this.detectorType = 'address';
            }
        });
    }

    /**
     * Build autoselect and init its events. Markup is the same as .cs-html-select but behaviour is different;
     * @private
     */
    private _buildAutosuggestSelect(data: any): void {
        const optionsHtml: string = this._buildOptions(data);

        if (!optionsHtml || this.optionsList === optionsHtml) {
            return;
        } else {
            this.optionsList = optionsHtml;
        }

        const selectHtml: string = `
                        <div class="cs-html-select cs-html-select--open cs-html-select--autosuggest">
                            <div class="cs-html-select__menu">
                                <ul class="cs-html-select__menu-list">
                                      ${optionsHtml}
                                </ul>
                            </div>
                        </div>
                        `;

        // If there is no select add new. If there is already select visible do not add new because it causes blinking. Instead of adding new select only replace its options.
        const $autosuggestSelect: JQuery = $('.cs-html-select--autosuggest');
        if (!$autosuggestSelect.length) {
            this.streetField.after(selectHtml);
        } else {
            $autosuggestSelect
                .find('.cs-html-select__menu-list')
                .empty()
                .append(optionsHtml);
        }

        const $jsSelect: JQuery = this.streetField.next('.cs-html-select');

        // Animate select initialization
        setTimeout(() => {
            $jsSelect.addClass('cs-html-select--animate');
        }, 50);

        setTimeout(() => {
            $jsSelect
                .find('.cs-html-select__menu-item')
                .eq(0)
                .addClass('cs-html-select__menu-item--focused');
            this._initSelectEvents($jsSelect);

            // If there is not house number add reminder note
            if (
                this.detectorType === 'place' &&
                !$('.cs-input__note--reminder').length
            ) {
                $jsSelect.after(
                    '<div class="cs-input__note cs-input__note--reminder">' +
                        $translate('Do not forget about <strong>') +
                        $translate('street number') +
                        '</strong>.</div>'
                );
            } else if (this.detectorType === 'address') {
                this.streetField
                    .parents('.cs-input')
                    .find('.cs-input__note')
                    .remove();
            }
        }, 300);
    }

    /**
     * Build options for autosuggest dropdown
     * @private
     */
    private _buildOptions(data: any): string {
        let optionsHtml: string = '';
        for (const result of data) {
            let address: object;
            let streetNumber: string = '';
            if (this.detectorType === 'place') {
                address = this.googlePlaceDetector.getFormattedAddress(result);
                streetNumber = this._detectHouseNr(
                    result.structured_formatting.main_text
                );
            } else if (this.detectorType === 'address') {
                address = this.googleAddressDetector.getFormattedAddress(
                    result
                );
            }

            const addressZip: string = address.postalCode
                ? address.postalCode
                : '';
            const addressCity: string = address.city;
            const addressStreet: string = address.street;
            const addressCountryCode: string =
                this.detectorType === 'address'
                    ? this._getCountryCodeFromResult(result)
                    : this.options.region;

            const dataValues: object = `{
                    "street": "${addressStreet}",
                    "streetNumber": "${streetNumber}",
                    "city": "${addressCity}",
                    "zip": "${addressZip}",
                    "countryCode": "${addressCountryCode}"
                }`;

            if (addressStreet && addressCity) {
                optionsHtml =
                    optionsHtml +
                    `<li class="cs-html-select__menu-item" data-value='${dataValues}'><a class="cs-html-select__menu-link">${address.full}</a></li>`;
            }
        }

        return optionsHtml;
    }

    /**
     * Init events on builded select 9up, down, click, enter. there is always focus on street field
     * @private
     */

    private _initSelectEvents(jsSelect: JQuery): void {
        function scrollToOption(
            $items: JQuery,
            selectedIndex: number,
            $menu: JQuery
        ): void {
            // scroll to selected option
            let offset: number =
                $items.eq(selectedIndex)[0].offsetTop - $menu[0].offsetTop;
            offset =
                offset - $menu[0].offsetHeight / 2 + $items.eq(0).height() / 2;
            $menu.animate(
                {
                    scrollTop: offset,
                },
                '250'
            );
        }

        let selectedIndex: number = 0;
        this.streetField.on('keyup', (e: KeyboardEvent) => {
            e.preventDefault();

            const $items: JQuery = jsSelect.find('.cs-html-select__menu-item');
            const $menu: JQuery = jsSelect.find('.cs-html-select__menu-list');

            if (e.which === 38) {
                if (selectedIndex > 0) {
                    selectedIndex = selectedIndex - 1;
                    $items.removeClass('cs-html-select__menu-item--focused');
                    $items
                        .eq(selectedIndex)
                        .addClass('cs-html-select__menu-item--focused');
                    scrollToOption($items, selectedIndex, $menu);
                } else {
                    jsSelect.remove();
                }
            } else if (e.which === 40) {
                if (selectedIndex < $items.length - 1) {
                    selectedIndex = selectedIndex + 1;
                    $items.removeClass('cs-html-select__menu-item--focused');
                    $items
                        .eq(selectedIndex)
                        .addClass('cs-html-select__menu-item--focused');
                    scrollToOption($items, selectedIndex, $menu);
                }
            } else if (e.which === 13) {
                const clickedValues: object = $items
                    .eq(selectedIndex)
                    .data('value');
                this._fillFields(clickedValues);
                this._focusOnNextEmptyField();

                jsSelect.remove();
            }
        });

        $('.cs-html-select__menu-item').on('click', (e: KeyboardEvent) => {
            e.preventDefault();
            const clickedValues: object = $(e.currentTarget).data('value');
            this._fillFields(clickedValues);
            this._focusOnNextEmptyField();

            jsSelect.remove();
        });

        // Close on click outside
        $(document).click((event: Event): void => {
            if (!$(event.target).closest('.cs-html-select').length) {
                jsSelect.remove();
            }
        });
    }

    /**
     * Fill fields if value available
     * @private
     */
    private _fillFields(clickedValues: object): void {
        this.cityField.val(clickedValues.city).change();

        if (clickedValues.zip) {
            this.zipField.val(clickedValues.zip).change();
        }

        if (this.numberField) {
            this.streetField.val(clickedValues.street).change();
            this.numberField.val(clickedValues.streetNumber).change();
        }

        if (this.detectorType === 'place') {
            this.streetField.val(clickedValues.street);
        }

        if (
            this.countrySelect &&
            this.countrySelect.val() !== clickedValues.countryCode
        ) {
            this.countrySelect.val(clickedValues.countryCode).change();
        }
    }

    /**
     * Focus on first field that need fill
     * @private
     */
    private _focusOnNextEmptyField(): void {
        if (this.detectorType === 'place' && !this.numberField) {
            this.streetField.focus();
        } else if (this.numberField) {
            this.numberField.focus();
        } else if (this.detectorType === 'address' && this.zipField.val()) {
            $('.cs-input__input[name="telephone"]').focus();
        } else {
            this.zipField.focus();
        }
    }

    /**
     * Check if last word is a number. If so it is probably house number - return it
     * @private
     */
    private _detectHouseNr(value: string): string {
        const regexp: RegExp = new RegExp('^\\d+[a-zA-Z-]*/*\\w*$', 'gi');
        const words: string[] = value.split(' ');
        const lastWord: string = words[words.length - 1];
        return regexp.test(lastWord) ? lastWord : '';
    }

    /**
     * Get country code from google result
     * @private
     */
    private _getCountryCodeFromResult(result: any): string {
        let country: string;
        for (const component of result.address_components) {
            country =
                component.types.indexOf('country') >= 0
                    ? component.short_name
                    : null;

            if (country) {
                return country;
            }
        }
    }

    /**
     * Watch if user changes country select. If yes build google detector with new options
     * @private
     */
    private _watchSelect(): void {
        this.countrySelect.on('change', () => {
            this.options.region = this.countrySelect.val();
            this.options.language = this.countrySelect.val();

            this.googleAddressDetector = new GoogleAddressDetector(
                this.options
            );
            this.googlePlaceDetector = new GooglePlaceDetector(this.options);
        });
    }
}

export { AddressAutofill };
