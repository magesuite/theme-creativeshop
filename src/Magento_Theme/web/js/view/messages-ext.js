/**
 * Mixin added in order to prevent message being displayed on other URL after load, when user hits "back" button before message was removed
 *
 * Messages observable is now cleaned on beforeunload event
 *
 * Aligned with Magento 2.4.8 on 05/2025
 */
define(['jquery'], function ($, wrapper) {
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
    };

    return function (target) {
        return target.extend(mixin);
    };
});
