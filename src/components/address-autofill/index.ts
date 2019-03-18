import {
    AddressAutofill as AddressAutofillComponent,
    IAddressAutofillOptions,
} from '../../components/address-autofill/address-autofill';

const AddressAutofill =  (options: IAddressAutofillOptions): AddressAutofillComponent => (
    new AddressAutofillComponent(options)
);

export { AddressAutofill }
