import bundle from 'bundle';
import $ from 'jquery';
import $translate from 'mage/translate';

import GoogleDetector from '../google-detector/google-detector';

export interface IAddressAutofillOptions {
    streetField: JQuery;
    zipField: JQuery;
    cityField: JQuery;
    countrySelect?: JQuery;
    language: string;
    region: string;
    apiKey: string;
    dev: boolean;
};

export default class AddressAutofill {

    constructor( options: IAddressAutofillOptions ) {
        this.streetField = options.streetField;
        this.zipField = options.zipField;
        this.cityField = options.cityField;
        this.countrySelect = options.countrySelect;

        $.getJSON( 'https://freegeoip.net/json/', ( location: any ): void => {
            options.region = location.country_code;
            options.language = window.navigator.userLanguage || window.navigator.language;
        } ).always( () => {
            this.googleAddressDetector = new GoogleDetector( options );
            this._initStreetField();
            this._initZipField();
        } );
    }

    /**
     * Trigger address autofill based on street
     * @private
     */
    private _initStreetField(): void {

        let typeTimer: any;
        const typeInterval: number = 1000;

        this.streetField.on( 'keyup', ( e: KeyboardEvent ): void => {

            clearTimeout( typeTimer );

            if ( e.which !== 8 ) {
                typeTimer = setTimeout( this._initGoogleStreetRequest.bind( this ), typeInterval );
            }

        });

    }

    /**
     * Send request to google api based on street value
     * @private
     */
    private _initGoogleStreetRequest(): void {
        const query: string = this.streetField.val();

        if ( !query || query.lenght < 4 ) {
            return;
        }

        this.googleAddressDetector.getResults( query ).then(
            ( data: any ) => {
                this._buildAutosuggestSelect( data, query );
            },
        );
    }

    /**
     * Trigger city autofill based on zip
     * @private
     */
    private _initGoogleZipRequest(): void {
        const query: string = this.zipField.val();

        if ( !query || query.lenght < 3 ) {
            return;
        }

        this.googleAddressDetector.getCityByPostalCode( query ).then(
            ( data: any ) => {
                if ( data ) {
                    this.cityField.val( data, query ).change().focus();
                }
            }
        );
    }

    /**
     * Send request to google api based on zip value
     * @private
     */
    private _initZipField(): void {
        let typeTimer: any;
        const typeInterval: number = 2000;

        this.zipField.on( 'keyup', (): void => {
            clearTimeout( typeTimer );

            typeTimer = setTimeout( this._initGoogleZipRequest.bind( this ), typeInterval );

        });

        this.zipField.on( 'blur', (): void => {
            this._initGoogleZipRequest();
        } );
    }

    /**
     * Build autoselect and init its events
     * @private
     */
    private _buildAutosuggestSelect( data: any, query: string ): void {
        console.log(data);
        // Remove old note and all select
        const inputParent: JQuery = this.streetField.parents( '.cs-input' );
        inputParent.find( '.cs-html-select' ).remove();
        inputParent.find( '.cs-input__note' ).remove();

        // If there is only one result fill zip and city with it. If there is more results show autosuggest select
        if ( data.length === 1 ) {
            this.zipField.val( this._getZipFromResult( data[ 0 ] ) );
            this.cityField.val( this._getCityFromResult( data[ 0 ] ) );

            this._addStreetNote( this.streetField, this._getStreetFromResult( data[ 0 ] ), query );

        } else {

            let optionsHtml: string = '';
            for ( const result of data) {
                console.log(result);
                const address: object = this.googleAddressDetector.getFormattedAddress( result );

                const addressZip: string = this._getZipFromResult( result );
                const addressCity: string = this._getCityFromResult( result );
                const addressStreet: string = this._getStreetFromResult( result );
                const addressCountry: string = this._getCountryFromResult( result );
                const addressCountryCode: string = this._getCountryCodeFromResult( result );

                const dataValues: {} = `{
                    "street": "${addressStreet}",
                    "city": "${addressCity}",
                    "zip": "${addressZip}",
                    "country": "${addressCountry}",
                    "countryCode": "${addressCountryCode}"
                }`;

                optionsHtml = optionsHtml + `<option value="${address.full}" data-value='${dataValues}'>${address.full}</option>`;
            }

            const selectHtml: string = `
                        <select class="cs-select" data-options-limit="5.5">
                            ${optionsHtml}
                        </select>
                        `;

            this.streetField.after(selectHtml);

            const select: Select = new bundle.Select(this.streetField.next('select'));

            const jsSelect: JQuery = this.streetField.next( '.cs-html-select' );
            const realSelect: JQuery = this.streetField.next( '.cs-html-select' ).find( 'select' );

            jsSelect.addClass( 'cs-html-select--autosuggest' );

            // Show select options by trigger click on it
            jsSelect.find( '.cs-html-select__trigger' ).trigger( 'click' );

            this._initSelectEvents( jsSelect, realSelect );
            this._addStreetNote( jsSelect, this._getStreetFromResult ( data[ 0 ] ), query );

        }

    }

    /**
     * Init events on build select
     * @private
     */
    private _initSelectEvents( jsSelect: JQuery, realSelect: JQuery ): void {
        jsSelect.find( '.cs-html-select__menu-item' ).on( 'click keyup', ( e: KeyboardEvent ) => {

            if ( e.type === 'keyup' ) {
                if ( e.which === 40 && $( e.currentTarget ).is( ':last-child' ) ) {
                    this.streetField.focus();
                    realSelect.remove();
                    jsSelect.remove();
                    return;
                } else if ( e.which === 38 && $( e.currentTarget ).is( ':first-child' ) ) {
                    this.streetField.focus();
                    realSelect.remove();
                    jsSelect.remove();
                    return;
                } else if ( e.which !== 13 ) {
                    return;
                }
            }

            const clickedValues: object = realSelect.find( 'option' ).eq( $( e.currentTarget ).data( 'original-index') ).data( 'value' );
            this.zipField.val( clickedValues.zip );
            this.cityField.val( clickedValues.city );

            if ( this.countrySelect ) {
                this.countrySelect.val( clickedValues.countryCode ).change();
            }

            // Remove select
            jsSelect.find( '.cs-html-select__trigger' ).trigger( 'click' );

        } );

    }

    /**
     * Build and append "Did you mean" note for script
     * @private
     */
    private _addStreetNote( prevElement: JQuery, suggestedValue: string, oldValue: string ): void {

        if ( suggestedValue && suggestedValue.toLowerCase() !== oldValue.replace(/[0-9&\/\\#,+()$~%.'":*?<>{}]/g, '').trim().toLowerCase() ) {
            prevElement.after('<div class="cs-input__note">' + $translate('Did you mean: <strong>') + suggestedValue + '</strong> ?</div>');
        }

    }

    /**
     * Get street from google result
     * @private
     */
    private _getStreetFromResult( result: any ): string {
        let street: string;
        for ( const component of result.address_components ) {
            if ( component.types.indexOf('route') >= 0 ) {
                street = component.long_name;
                break;
            }
        }
        return street ? street : '';
    }

    /**
     * Get zip from google result
     * @private
     */
    private _getZipFromResult( result: any ): string {
        let zip: string;
        for ( const component of result.address_components ) {
            if ( component.types.indexOf('postal_code') >= 0 ) {
                zip = component.long_name;
                break;
            }
        }
        return zip ? zip : '';
    }

    /**
     * Get city from google result
     * @private
     */
    private _getCityFromResult( result: any ): string {
        let city: string;
        for ( const component of result.address_components ) {
            if ( component.types.indexOf('locality') >= 0 ) {
                city = component.long_name;
                break;
            }
        }

        return city ? city : '';
    }

    /**
     * Get country from google result
     * @private
     */
    private _getCountryFromResult( result: any ): string {
        let country: string;
        for ( const component of result.address_components ) {
            country = component.types.indexOf('country') >= 0 ? component.long_name : null;
        }
        return country ? country : '';
    }

    /**
     * Get country code from google result
     * @private
     */
    private _getCountryCodeFromResult( result: any ): string {
        let country: string;
        for ( const component of result.address_components ) {
            country = component.types.indexOf('country') >= 0 ? component.short_name : null;
        }
        return country ? country : '';
    }
}

export { AddressAutofill };
