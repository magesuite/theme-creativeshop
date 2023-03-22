/**
 * Origin: Native M2 Modal Widget
 * Modification type: extend
 * Reasons:
 * - add modal-no-scroll class to body when modal is opened and calculate scroll position
 * - add no-scroll-child class to page-wrapper element
 * - do not add additional above logic if body already has inline top style property
 */
define(['jquery'], function ($) {
    'use strict';

    return function (mageModal) {
        $.widget('mage.modal', mageModal, {
            _createOverlay: function () {
                if ($('.minicart-offcanvas-open').length) {
                    this._super();
                    return;
                }

                const $currentTopOffset = window.scrollY;

                $('body')
                    .addClass('modal-no-scroll')
                    .css({ top: -$currentTopOffset });

                $('.page-wrapper').addClass('no-scroll-child');

                this._super();
            },
            _destroyOverlay: function () {
                this._super();

                if ($('.minicart-offcanvas-open').length) {
                    return;
                }

                const $currentTopOffset = $('body').css('top');

                $('body').removeClass('modal-no-scroll').css({ top: '' });
                $('.page-wrapper').removeClass('no-scroll-child');

                window.scrollTo(0, parseInt($currentTopOffset || '0', 10) * -1);
            },
        });

        return $.mage.modal;
    };
});
