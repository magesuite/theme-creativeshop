import $ from 'jquery';

import {
    default as GoogleAddressDetector,
    FormattedAddress,
} from '../google-address-detector/google-address-detector';

export interface IAddressAutofillOptions {
    streetField: JQuery;
    numberField?: JQuery;
    zipField: JQuery;
    cityField: JQuery;
    countrySelect?: JQuery;
    stateField?: JQuery;
    language: string;
    region: string;
}

export default class AddressAutofill {
    protected options: IAddressAutofillOptions;
    protected googleAddressDetector: GoogleAddressDetector;
    protected $autosuggestSelect: JQuery;
    protected $autosuggestSelectMenu: JQuery;

    constructor(options: IAddressAutofillOptions) {
        this.options = options;

        const countrySelectValue = this.options.countrySelect
            ? (options.countrySelect.val() as string)
            : '';
        options.region = countrySelectValue || 'DE';
        options.language =
            countrySelectValue ||
            window.navigator.userLanguage ||
            window.navigator.language;

        this.googleAddressDetector = new GoogleAddressDetector(options);

        this._initStreetField();
        this._initZipField();
        this._initCountrySelector();
        this._initAutosuggest();
    }

    /**
     * Manages address autosuggest on street field input.
     */
    protected _initStreetField(): void {
        let typeTimer: number;
        const typeInterval: number = 200;
        let currentValue: string = this.options.streetField.val() as string;

        this.options.streetField.on(
            'keyup',
            (e: KeyboardEvent): void => {
                clearTimeout(typeTimer);
                const newValue = this.options.streetField.val() as string;

                if (currentValue.length < newValue.length) {
                    typeTimer = setTimeout(
                        this._triggerAutosuggest.bind(this),
                        typeInterval
                    );
                }
                currentValue = newValue;
            }
        );
    }

    /**
     * Triggers google autosuggest based on street field value and zip/city if exist.
     */
    protected _triggerAutosuggest(): void {
        const zip: string = (this.options.zipField.val()
            ? this.options.zipField.val() + ' '
            : '') as string;
        const city: string = (this.options.cityField.val()
            ? this.options.cityField.val() + ' '
            : '') as string;
        const street: string = this.options.streetField.val() as string;

        const query: string = (zip + city + street) as string;

        if (!query || street.length < 3) {
            console.log('return');
            return;
        }

        this.googleAddressDetector.getFormattedResults(query).then(results => {
            this._hideAutosuggest();
            this._buildAutosuggestSelect(results);
        });
    }

    /**
     * Automatically fills all fields based on ZIP field value.
     */
    protected _fillFieldsBasedOnZip(): void {
        const query: string = this.options.zipField.val() as string;

        if (!query || query.length < 3) {
            return;
        }

        this.googleAddressDetector.getFormattedResults(query).then(results => {
            if (results[0]) {
                this._fillFields(results[0]);
            }
        });
    }

    /**
     * Resets autosuggest dropdown.
     */
    protected _initAutosuggest(): void {
        // First remove old autosuggest
        $('.cs-html-select--autosuggest').remove();
        this.$autosuggestSelect = $(`<div class="cs-html-select cs-html-select--open cs-html-select--autosuggest">
                <div class="cs-html-select__menu">
                    <ul class="cs-html-select__menu-list"></ul>
                </div>
            </div>`);
        this.$autosuggestSelectMenu = this.$autosuggestSelect.find(
            '.cs-html-select__menu-list'
        );
        this.options.streetField.after(this.$autosuggestSelect);
        this._initAutosuggestEvents();
    }

    /**
     * Builds autosuggest dropdown based on given results.
     * @param results Formated results returned by Geocoding API.
     */
    protected _buildAutosuggestSelect(results: FormattedAddress[]): void {
        const optionsHtml: string = this._buildOptions(results);

        if (!optionsHtml) {
            return;
        }

        this._initAutosuggest();
        this.$autosuggestSelect
            .find('.cs-html-select__menu-list')
            .html(optionsHtml)
            .show();

        // Animate select initialization.
        setTimeout(() => {
            this.$autosuggestSelect.addClass('cs-html-select--animate');
        }, 50);

        setTimeout(() => {
            this.$autosuggestSelect
                .find('.cs-html-select__menu-item')
                .eq(0)
                .addClass('cs-html-select__menu-item--focused');

            this.options.streetField
                .parents('.cs-input')
                .find('.cs-input__warning')
                .remove();
        }, 300);
    }

    /**
     * Builds all autocomplete options based on given addresses.
     * @param results List of found addresses.
     */
    protected _buildOptions(results: FormattedAddress[]): string {
        let optionsHtml: string = '';
        results.forEach(address => {
            if (address.city) {
                optionsHtml =
                    optionsHtml +
                    `<li class="cs-html-select__menu-item" data-value='${JSON.stringify(
                        address
                    )}'>
                        <a class="cs-html-select__menu-link">${address.full}</a>
                    </li>`;
            }
        });

        return optionsHtml;
    }

    /**
     * Initialize all events for built autosuggest dropdown.
     */
    protected _initAutosuggestEvents(): void {
        /**
         * Makes sure focused option is always visible by scrolling the dropdown.
         * @param selectedIndex Item index.
         */
        const scrollToOption = (
            $menu: JQuery,
            $items: JQuery,
            selectedIndex: number
        ) => {
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
        };

        let selectedIndex: number = 0;
        this.options.streetField.on('keyup keypress', (e: KeyboardEvent) => {
            const $menu: JQuery = this.$autosuggestSelectMenu;
            const $items: JQuery = this.$autosuggestSelectMenu.find(
                '.cs-html-select__menu-item'
            );

            if (e.which === 38 || e.which === 40 || e.which === 13) {
                e.preventDefault();
            }

            if (e.which === 38) {
                // Up arrow key.
                if (selectedIndex > 0) {
                    selectedIndex = selectedIndex - 1;
                    $items.removeClass('cs-html-select__menu-item--focused');
                    $items
                        .eq(selectedIndex)
                        .addClass('cs-html-select__menu-item--focused');
                    scrollToOption($menu, $items, selectedIndex);
                } else {
                    this._hideAutosuggest();
                }
            } else if (e.which === 40) {
                // Down arrow key.
                if (selectedIndex < $items.length - 1) {
                    selectedIndex = selectedIndex + 1;
                    $items.removeClass('cs-html-select__menu-item--focused');
                    $items
                        .eq(selectedIndex)
                        .addClass('cs-html-select__menu-item--focused');
                    scrollToOption($menu, $items, selectedIndex);
                }
            } else if (e.which === 13) {
                // Enter key.
                const selectedAddress: FormattedAddress = $items
                    .eq(selectedIndex)
                    .data('value');
                if (selectedAddress) {
                    this._fillFields(selectedAddress);
                    this._focusEmptyField();
                    this._hideAutosuggest();
                }
            }
        });

        $(document).click(
            (event: Event): void => {
                if ($(event.target).closest('.cs-html-select').length) {
                    const $items: JQuery = this.$autosuggestSelectMenu.find(
                        '.cs-html-select__menu-item'
                    );
                    event.preventDefault();
                    const selectedAddress: FormattedAddress = $(event.target)
                        .closest($items)
                        .data('value');
                    this._fillFields(selectedAddress);
                    this._focusEmptyField();
                }
                this._hideAutosuggest();
            }
        );
    }

    protected _hideAutosuggest(): void {
        this.$autosuggestSelectMenu.empty();
        this.$autosuggestSelect.removeClass('cs-html-select--animate');
    }

    /**
     * Fills appropriate fields based on given address data.
     * @param address Address data to fill the fields with.
     */
    protected _fillFields(address: FormattedAddress): void {
        if (this.options.cityField && address.city) {
            this.options.cityField.val(address.city).change();
        }

        if (address.postalCode) {
            this.options.zipField.val(address.postalCode).change();
        }

        if (address.street) {
            if (this.options.numberField) {
                this.options.streetField.val(address.street).change();
                this.options.numberField.val(address.streetNumber).change();
            } else {
                const streetNumber = address.streetNumber
                    ? ' ' + address.streetNumber
                    : '';
                this.options.streetField
                    .val(address.street + streetNumber)
                    .change();
            }
        }

        if (
            this.options.countrySelect &&
            this.options.countrySelect.val() !== address.countryCode
        ) {
            this.options.countrySelect.val(address.countryCode).change();
        }

        if (this.options.stateField && address.state) {
            this.options.stateField.val(address.state).change();
        }
    }

    /**
     * Focuses on next empty, required input after street input gets filled.
     */
    protected _focusEmptyField(): void {
        const $requiredEmptyInputs = this.options.streetField
            .closest('form')
            .find('._required input')
            .filter((index, element) => !jQuery(element).val());

        $requiredEmptyInputs.eq(0).focus();
    }

    /**
     * Initializes watching ZIP field for changes.
     */
    protected _initZipField(): void {
        let typeTimer: number;
        const typeInterval: number = 1000;

        this.options.zipField.on(
            'keyup',
            (): void => {
                if (!this.options.cityField.val()) {
                    clearTimeout(typeTimer);
                    typeTimer = setTimeout(
                        this._fillFieldsBasedOnZip.bind(this),
                        typeInterval
                    );
                }
            }
        );

        this.options.zipField.on(
            'blur',
            (): void => {
                if (!this.options.cityField.val()) {
                    this._fillFieldsBasedOnZip();
                }
            }
        );
    }

    /**
     * Rebuild address detector each time user changes country.
     */
    protected _initCountrySelector(): void {
        this.options.countrySelect.on('change', () => {
            this.options.region = this.options.countrySelect.val() as string;
            this.options.language = this.options.countrySelect.val() as string;

            this.googleAddressDetector = new GoogleAddressDetector(
                this.options
            );
        });
    }
}

export { AddressAutofill };
