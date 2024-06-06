/**
 * Origin: Native M2 Modal Widget
 * Modification type: extend
 * Reasons:
 * - add modal-no-scroll class to body when modal is opened and calculate scroll position
 * - do not add additional above logic if minicart or offcanvas navigation arw opened
 * Aligned with Magento 2.4.7 in 04/2024
 */
define(['jquery'], function ($) {
    'use strict';

    return function (mageModal) {
        $.widget('mage.modal', mageModal, {
            _createOverlay: function () {
                if (this._canAppplyNoScroll()) {
                    const $currentTopOffset = window.scrollY;

                    $('body')
                        .addClass('modal-no-scroll')
                        .css({ top: -$currentTopOffset });
                }

                this._super();
            },
            _destroyOverlay: function () {
                this._super();

                if (this._canAppplyNoScroll()) {
                    const $currentTopOffset = $('body').css('top');

                    $('body').removeClass('modal-no-scroll').css({ top: '' });
                    window.scrollTo(
                        0,
                        parseInt($currentTopOffset || '0', 10) * -1
                    );
                }
            },
            /**
             * Custom method (not overriden one)
             */
            _canAppplyNoScroll: function () {
                return !(
                    $('.minicart-offcanvas-open').length ||
                    $('.navigation-offcanvas-open').length ||
                    this._getVisibleCount()
                );
            },
        });

        return $.mage.modal;
    };
});
