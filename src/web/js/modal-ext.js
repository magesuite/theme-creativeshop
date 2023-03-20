/**
 * Origin: Native M2 Modal Widget
 * Modification type: extend
 * Reasons:
 * - add no-scroll class to body when modal is opened and calculate scroll position
 */
define(['jquery'], function ($) {
    'use strict';

    return function (mageModal) {
        $.widget('mage.modal', mageModal, {
            _createOverlay: function () {
                const $currentTopOffset = window.scrollY;

                $('body')
                    .addClass('no-scroll')
                    .css({ top: -$currentTopOffset });

                $('.page-wrapper').addClass('no-scroll-child');

                this._super();
            },
            _destroyOverlay: function () {
                this._super();

                const $currentTopOffset = $('body').css('top');

                $('body').removeClass('no-scroll').css({ top: '' });
                $('.page-wrapper').removeClass('no-scroll-child');

                window.scrollTo(0, parseInt($currentTopOffset || '0', 10) * -1);
            },
        });

        return $.mage.modal;
    };
});
