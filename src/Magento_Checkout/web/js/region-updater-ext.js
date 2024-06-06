/**
 * Region updater extension which is responsible for toggling whole input section
 * including our custom containers and labels when selected country changes.
 *
 * Desired functionality includes:
 * - Showing entire "State/Province" field when it is required.
 * - Hiding it when it is not.
 * Aligned with Magento 2.4.7 in 04/2024
 */
define(['jquery'], function ($) {
    'use strict';

    return function (regionUpdater) {
        return $.widget('mage.regionUpdater', regionUpdater, {
            _updateRegion: function (country) {
                this._super(country);

                var $regionInput = $(this.options.regionInputId);
                var $regionList = $(this.options.regionListId);

                if (
                    $regionInput.css('display') !== 'none' ||
                    $regionList.prop('disabled')
                ) {
                    $regionList
                        .closest('.cs-input')
                        .addClass('cs-visually-hidden');
                } else {
                    $regionList
                        .closest('.cs-input')
                        .removeClass('cs-visually-hidden');
                }
            },
        });
    };
});
