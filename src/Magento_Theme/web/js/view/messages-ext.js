/**
 * Mixin added in order to:
 * - prevent message being displayed on other URL after load, when user hits "back" button before message was removed
 *   (messages observable is cleaned on beforeunload event)
 * - remove a single message from the markup when it is closed (manually or auto-hidden)
 *
 * Aligned with Magento 2.4.9 in 05/2026
 */
define(['jquery', 'Magento_Customer/js/customer-data'], function ($, customerData) {
    'use strict';

    var mixin = {
        initialize: function () {
            this._super();

            this._attachUnloadEvent();
        },

        _attachUnloadEvent: function () {
            $(window).on('beforeunload', () => {
                this.purgeMessages();
            });
        },

        removeCookieMessage: function (message) {
            this.cookieMessagesObservable(
                this.cookieMessagesObservable().filter((item) => item !== message)
            );
        },

        removeMessage: function (message) {
            customerData.set('messages', {
                messages: this.messages().messages.filter((item) => item !== message),
            });
        },
    };

    return function (target) {
        return target.extend(mixin);
    };
});
