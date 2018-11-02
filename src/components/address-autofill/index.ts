import * as $ from 'jquery';

import {
    AddressAutofill,
    IAddressAutofillOptions,
} from '../../components/address-autofill/address-autofill';

export default (options: IAddressAutofillOptions): AddressAutofill =>
    new AddressAutofill(options);
