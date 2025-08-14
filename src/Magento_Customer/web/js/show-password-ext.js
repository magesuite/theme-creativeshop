/**
 * Mixin due to:
 * - added show password icon to password input
 */
define([
  'jquery', 
  'mgsTogglePassword', 
  'mgsWaitForElement'
], function ($, mgsTogglePassword, mgsWaitForElement) {
    'use strict';

    return function (target) {
        return target.extend({
            initialize: function () {
                this._super();

                this._passwordIconInit();
            },

            _initTogglePassword: function (elements) {
                elements.each(function () {
                    new mgsTogglePassword.TogglePassword($(this));
                });
            },

            _passwordIconInit: function () {
                const passwordInputs = $(this.passwordSelector);

                if (!passwordInputs?.length) {
                    mgsWaitForElement(this.passwordSelector).then(
                        (element) => {
                            this._initTogglePassword($(element));
                        }
                    );
                }

                this._initTogglePassword(passwordInputs);
            },
        });
    };
});
