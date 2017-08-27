/* tslint:disable:no-console no-unused-expression*/

import $ from 'jquery';

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
export default class GooglePlaceDetector {
  /**
   *
   * @param {Object} options - Options for service
   * @param {String} options.dev - Flag indicator for debugging
   * @param {String} options.apiKey - Api key string for production (will work without it on dev)
   * @param {String} options.language - Language for results
   * @param {String} options.region - Region in which results will be restricted. 2 letter, ISO code, uppercase (PL, DE)
   * @constructor
   */
  constructor(options: {
    dev: boolean;
    apiKey: string;
    language: string;
    region: string;
  }) {
    this.dev = options.dev;
    this.options = options;

    this.baseApiUrl =
      'https://maps.googleapis.com/maps/api/place/autocomplete/json';
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
  public getResults(query: string): any {
    return this._callGoogleApi(query);
  }

  /**
   * Get results but already formatted
   * @param query
   * @returns {Promise.<T>} Promise with array of formatted result matches
   */
  public getFormattedResults(query: string): any {
    return this._callGoogleApi(query).then((predictions: any): any => {
      const formattedResults: any = [];

      predictions.map((result: any): any => {
        formattedResults.push(this.getFormattedAddress(result));
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
  public getFormattedAddress(result: any): any {
    const components: any = result.terms;

    const address: { full: any; street?: string; city?: string } = {
      full: result.description,
    };

    let i: number = 0;
    for (const component of components) {
      result.types[i] === 'route' || result.types[i] === 'street_address'
        ? (address.street = component.value)
        : null;
      if (i === components.length - 1 && components.length > 1) {
        address.city = component.value;
      }
      i++;
    }

    return address;
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
  private _callGoogleApi(query: string): any {
    const params: object = this.apiParams;
    params.input = query;

    return $.get(this.baseApiUrl, params).then(
      (data: any) => {
        if (data.status === 'OK') {
          return data.predictions || null;
        } else if (data.status !== 'OK' && this.dev) {
          console.log('error with api');
        } else if (data.status === 'OK' && !data.results.length && this.dev) {
          console.log('no results');
        }
      },
      (err: string): void => {
        console.log(err);
      }
    );
  }
}
