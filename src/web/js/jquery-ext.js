/**
 * Origin: M2 jQuery v3.6.0
 * Modification type: extend
 * Reasons:
 * - enable scroll passive for mobile scrolling performance
 * Aligned with Magento 2.4.7 in 04/2024
 * Ref: https://github.com/magento/magento2/pull/35613
 */
define([], function () {
    'use strict';

    function addPassiveListeners(jQuery) {
        jQuery.event.special.touchstart = {
            setup: function (_, ns, handle) {
                this.addEventListener('touchstart', handle, {
                    passive: !ns.includes('noPreventDefault'),
                });
            },
        };

        jQuery.event.special.touchmove = {
            setup: function (_, ns, handle) {
                this.addEventListener('touchmove', handle, {
                    passive: !ns.includes('noPreventDefault'),
                });
            },
        };

        jQuery.event.special.wheel = {
            setup: function (_, ns, handle) {
                this.addEventListener('wheel', handle, { passive: true });
            },
        };

        jQuery.event.special.mousewheel = {
            setup: function (_, ns, handle) {
                this.addEventListener('mousewheel', handle, { passive: true });
            },
        };
    }

    return function ($) {
        addPassiveListeners($);

        return $;
    };
});
