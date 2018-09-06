import $ from 'jquery';

import {
    AddressAutofill,
    IAddressAutofillOptions,
} from '../../components/address-autofill/address-autofill';

export default (options: IAddressAutofillOptions): AddressAutofill => {
    const googleApi = $('#google-api-settings');

    // Check if element from which we take data exists if it doesn't do not continue
    if (!googleApi.length) {
        return;
    }
    const language = googleApi.data('google-api-language') || 'de';
    const region = googleApi.data('google-api-region') || 'DE';
    const apiKey = googleApi.data('google-api-key');

    options = $.extend(
        {
            language: language,
            region: region,
            apiKey: apiKey,
            dev: false,
        },
        options
    );

    return new AddressAutofill(options);
};
