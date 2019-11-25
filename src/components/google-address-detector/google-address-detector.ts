import * as $ from 'jquery';

export interface FormattedAddress {
    full: string;
    streetNumber?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    state?: string;
    countryCode?: string;
}

interface GeocodeApiParams {
    language: string;
    region: string;
    components: string;
    form_key?: string;
}

export default class GoogleAddressDetector {
    protected apiUrl: JQueryDeferred<string> = jQuery.Deferred();
    protected formKey: JQueryDeferred<string> = jQuery.Deferred();
    protected baseApiParams: GeocodeApiParams;

    constructor(options: { language: string; region: string }) {
        this.baseApiParams = {
            language: options.language,
            region: options.region,
            components: `country:${options.region.toUpperCase()}`,
        };

        this._setApiUrl();
        this._setFormKey();
    }

    /**
     * Returns raw results based on given search query.
     * @param query Geocoding API search query.
     */
    public getResults(query: string): any {
        return this._callGoogleApi(query);
    }

    /**
     * Returns formated results based on given search query.
     * @param query Geocoding API search query.
     */
    public getFormattedResults(
        query: string
    ): JQueryDeferred<FormattedAddress[]> {
        return this.getResults(query).then(results =>
            results.map(result => this._formatResult(result))
        );
    }

    protected _formatResult(result: any): FormattedAddress {
        const components: any = result.address_components;
        const address: FormattedAddress = {
            full: result.formatted_address,
            streetNumber: '',
            street: '',
            city: '',
            postalCode: '',
            countryCode: '',
        };

        for (const component of components) {
            if (component.types.indexOf('street_number') >= 0) {
                address.streetNumber = component.long_name;
            }

            if (component.types.indexOf('route') >= 0) {
                address.street = component.long_name;
            }

            if (component.types.indexOf('locality') >= 0) {
                address.city = component.long_name;
            }

            if (component.types.indexOf('postal_code') >= 0) {
                address.postalCode = component.long_name;
            }

            if (component.types.indexOf('country') >= 0) {
                address.countryCode = component.short_name;
            }

            if (component.types.indexOf('administrative_area_level_1') >= 0) {
                address.state = component.long_name;
            }
        }

        return address;
    }

    protected _callGoogleApi(query: string) {
        const apiParams = $.extend({ address: query }, this.baseApiParams);

        return this.formKey
            .then(formKey => {
                apiParams.form_key = formKey;

                return this.apiUrl;
            })
            .then(apiUrl => {
                return $.get(apiUrl, apiParams).then(
                    (data): FormattedAddress[] =>
                        data.status === 'OK' ? data.results : [],
                    (error): void => {
                        // tslint:disable-next-line
                        console.error(error);
                    }
                );
            });
    }

    protected _setApiUrl() {
        requirejs(['mage/url'], mageUrl => {
            this.apiUrl.resolve(
                mageUrl.build('googleapi/index/geolocation/', {})
            );
        });
    }

    protected _setFormKey() {
        requirejs(['mage/cookies'], mageUrl => {
            this.formKey.resolve($.mage.cookies.get('form_key'));
        });
    }
}
