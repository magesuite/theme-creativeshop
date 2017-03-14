import axios from 'axios';

/**
 * Google geocode detector class
 * Features:
 *  - Detect address matches from various queries
 *  - Map results to filtered, easy to read objects
 *  - Presets: get corrected street, get city from postal code and get postal code from full street
 *
 * Dependencies: jQuery, promises
 * Roadmap:
 *  - Add dependency injection for different ajax clients
 */
export default class GoogleDetector {
    /**
     *
     * @param {Object} options - Options for service
     * @param {String} options.dev - Flag indicator for debugging
     * @param {String} options.apiKey - Api key string for production (will work without it on dev)
     * @param {String} options.language - Language for results
     * @param {String} options.region - Region in which results will be restricted. 2 letter, ISO code, uppercase (PL, DE)
     * @constructor
     */
    constructor(options) {

        this.dev = options.dev;

        this.baseApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        this.apiKey = options.apiKey;
        this.basicParams = {
            language: options.language,
            region: options.region,
            key: this.apiKey || null,
            components: 'country:' + options.region.toUpperCase(),
        };

        this._setCallParams();
    }

    /**
     * Get all native google geocode addresses
     * @param {String} query - Phrase to search, the more accurate, the best will be results
     * @returns {Promise} addressResults - Promise with pure google geocode objects with all data
     * @public
     */
    public getResults( query: string ): any {
        return this._callGoogleApi( query );
    }

    /**
     * Get results but already formatted
     * @param query
     * @returns {Promise.<T>} Promise with array of formatted result matches
     */
    public getFormattedResults( query ): string {
        return this._callGoogleApi( query ).then( ( results ) => {
            let formattedResults: any[] = [];

            results.map( ( result ) => {
                formattedResults.push( this.getFormattedAddress( result ) );
            });

            return formattedResults;
        });
    }

    /**
     * Gets formatted address from one native google address
     * @param {Object} result - native google geocode result
     * @returns {{full: String, streetNumber: String, city: String, postalCode: String}} formattedAddress - Ready for
     * use formatted address
     * @public
     */
    public getFormattedAddress( result: any ): {} {
        const components = result.address_components;

        let address: {} = {
            full: result.formatted_address,
        };

        for (const component of components) {
            component.types.indexOf('street_number') >= 0 ? address.streetNumber = component.long_name : null;
            component.types.indexOf('route') >= 0 ? address.street = component.long_name : null;
            component.types.indexOf('locality') >= 0 ? address.city = component.long_name : null;
            component.types.indexOf('postal_code') >= 0 ? address.postalCode = component.long_name : null;
        }

        return address;
    }

    /**
     * Gets city from postal code
     * @param {String} postalCode - postal code
     * @returns {Promise.String} - Promise with string with city
     * @public
     */
    public getCityByPostalCode( postalCode ): string {
        return this._callGoogleApi( postalCode )
            .then( (result): string => {
                return this.getFormattedAddress( result[ 0 ] ).city;
            });
    }

    /**
     * Gets city from postal code
     * @param {String} streetQuery - street & street number query
     * @returns {Promise.String} - Promise with string with postal code
     * @public
     */
    public getPostalCodeByFullStreet( streetQuery:string ): string {

        return this._callGoogleApi( streetQuery )
            .then( ( result ): string => {
                return this.getFormattedAddress(result[0]).postalCode;

            });
    }

    /**
     * Gets corrected street name if differs from provided
     * @param {String} streetQuery - street query
     * @returns {Promise.String|null} - Promise with string with street or null if matches
     * @public
     */
    public getCorrectStreetName( streetQuery ) {
        return this._callGoogleApi( streetQuery )
            .then( ( result ): string => {
                const street = this.getFormattedAddress(result[0]).street;

                return street === streetQuery ? null : street;

            });
    }

    /**
     * Sets api parameters for call once
     * @private
     */
    private _setCallParams(): void {
        this.apiParams = {
            language: this.basicParams.language,
            region: this.basicParams.region,
            components: this.basicParams.components,
        };

        if (this.basicParams.key) {
            this.apiParams.key = this.apiKey;
        }
    }

    /**
     * Get google  results from query
     * @param {String} query
     * @returns {Promise.<T>}
     * @private
     */
    private _callGoogleApi( query ): any {

        let params: {} = this.apiParams;
        params.address = query;

        console.log(params);

        return axios
            .get(this.baseApiUrl, {params: params})
            .then((res) => {
                console.log(res);
                const data = res.data;
                if (data.status === 'OK') {
                    return data.results || null;
                } else if (data.status !== 'OK' && this.dev) {
                    console.log('error with api');
                } else if (data.status === 'OK' && !data.results.length && this.dev) {
                    console.log('no results');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

export {GoogleDetector};
