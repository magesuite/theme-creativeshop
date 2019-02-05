/**
 * Provide additional methods to shipping step
 */
define(['jquery'], function($) {
  'use strict';

  return function(Shipping) {
    return Shipping.extend({
      enableForm: function() {
        $('#shipping-new-address-form input').removeAttr( 'disabled' ).find('input,' +
          ' ' +
          'select' ).removeAttr( 'disabled' );
      },
      disableForm: function() {
        $('#shipping-new-address-form .cs-input').attr( 'disabled', 'disabled').find('input, ' +
          'select').attr( 'disabled', 'disabled');
      }

    });
  };

});
