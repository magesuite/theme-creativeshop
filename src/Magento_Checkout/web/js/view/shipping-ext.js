/**
 * Provide additional methods to shipping step
 */
define(['jquery'], function($) {
  'use strict';

  return function(Shipping) {
    return Shipping.extend({
      enableForm: function() {
        $('#shipping-new-address-form .cs-input').removeClass('cs-input--disabled').find('input,' +
          ' ' +
          'select' ).removeAttr( 'disabled' );
      },
      disableForm: function() {
        $('#shipping-new-address-form .cs-input').addClass('cs-input--disabled' ).find('input, ' +
          'select').attr( 'disabled', 'disabled');
      }

    });
  };

});
