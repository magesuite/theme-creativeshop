import $ from "jquery";

import {
  AddressAutofill,
  IAddressAutofillOptions
} from "../../components/address-autofill/address-autofill";

export default (options: IAddressAutofillOptions): AddressAutofill => {
  options = $.extend(
    {
      language: "de",
      region: "DE",
      apiKey: "AIzaSyDwjU7ABFBMRg_i6pU4gYTnGFZvLUS2Y94",
      dev: false
    },
    options
  );

  return new AddressAutofill(options);
};
