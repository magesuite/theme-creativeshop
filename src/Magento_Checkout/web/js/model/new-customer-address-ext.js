define([
  'mage/translate',
  'underscore'
], function($t,_) {
  'use strict';
  return function(NewCustomerAddress) {
    var originalFunction = NewCustomerAddress;

    function isAddressPackstationOrPostOffice(address) {
      if (address == null) {
        return false;
      }

      var streetLines = address.street ? address.street : [],
        packstationStr = $t('Packstation').toString().toLowerCase(),
        postOfficeStr = $t('Post Office').toString().toLowerCase(),
        isAddressPackstationOrPostOffice = false;

      streetLines.forEach(function (entry) {
        entry = entry.toLowerCase();

        if (entry.indexOf(packstationStr) >= 0 || entry.indexOf(postOfficeStr) >= 0) {
          isAddressPackstationOrPostOffice = true;
          return false;
        }
      });

      return isAddressPackstationOrPostOffice;
    }

    return function(addressData) {
      var customerAddress = originalFunction(addressData);
      return _.extend({}, customerAddress, {
        canUseForBilling: function () {
          return (!addressData || isAddressPackstationOrPostOffice(addressData) ) ? false : true;
        }
      });
    }
  };
});
