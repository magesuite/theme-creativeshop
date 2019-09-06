import $ from 'jquery';

import {
    AddressAutofill,
    IAddressAutofillOptions,
} from '../../components/address-autofill/address-autofill';

export default (options: IAddressAutofillOptions): AddressAutofill => {
    options = $.extend(
        {
            language: 'de',
            region: 'DE',
        },
        options
    );

    return new AddressAutofill(options);
};
