/**
 * Custom module that enables any submit button in forms that require proper
 * form key to be provided e.g. add to cart button on PDP.
 */
define(['jquery', 'jquery/ui'], function($) {
    'use strict';

    return function() {
        $.widget('mage.formKey', $.mage.formKey, {
            _create: function() {
                this._super();
                $(this.options.inputSelector)
                    .closest('form')
                    .find('[type="submit"]')
                    .prop('disabled', false);
            },
        });

        return $.mage.formKey;
    };
});
