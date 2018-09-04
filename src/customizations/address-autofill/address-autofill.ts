import $ from 'jquery';

import {
    AddressAutofill,
    IAddressAutofillOptions,
} from '../../components/address-autofill/address-autofill';

export default (options: IAddressAutofillOptions): AddressAutofill => {
    const googleApi = $('#google-api-settings');
    const apiKey = googleApi.data('google-api-key');
    const language = googleApi.data('google-api-language') || 'de';
    const region = googleApi.data('google-api-region') || 'DE';
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
