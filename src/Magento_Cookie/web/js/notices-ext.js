/**
 * Origin: Native M2 CookieNotices widget
 * Modification type: override
 * Reason: Show cookie notice bar when cookie is not set instead hide it if cookie exist. | l:18
 */

define([
    'jquery',
    'jquery-ui-modules/widget',
    'mage/cookies'
], function ($) {
    'use strict';

    return function (config) {
        return $.widget('mage.cookieNotices', {
            /** @inheritdoc */
            _create: function () {
                if (!$.mage.cookies.get(this.options.cookieName)) {
                    this.element.show();
                }

                $(this.options.cookieAllowButtonSelector).on('click', $.proxy(function () {
                    const cookieExpires = new Date(new Date().getTime() + this.options.cookieLifetime * 1000);

                    $.mage.cookies.set(this.options.cookieName, JSON.stringify(this.options.cookieValue), {
                        expires: cookieExpires
                    });

                    if ($.mage.cookies.get(this.options.cookieName)) {
                        this.element.hide();
                        $(document).trigger('user:allowed:save:cookie');
                    } else {
                        window.location.href = this.options.noCookiesUrl;
                    }
                }, this));
            }
        });
    }
});
