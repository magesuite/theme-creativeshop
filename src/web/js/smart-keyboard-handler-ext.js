/**
 * Fixes core handleFocus() so the '_keyfocus' body class is removed on blur instead of staying stuck after a programmatic focus (e.g. missing-swatches validation).
 * Aligned with Magneto 2.4.9 in 07/2026
 */
define(['jquery'], function ($) {
    'use strict';

    return function (keyboardHandler) {
        keyboardHandler.focus = function (element) {
            element.on('focusin.emulateTabFocus', function () {
                $('body').addClass('_keyfocus');
            });

            element.on('focusout.emulateTabFocus', function () {
                $('body').removeClass('_keyfocus');
                element.off('.emulateTabFocus');
            });
        };

        return keyboardHandler;
    };
});
