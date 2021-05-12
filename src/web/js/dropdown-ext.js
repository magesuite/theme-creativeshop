/**
 * Origin: Native M2 Collapsible Widget
 * Modification type: extend
 * Reasons:
 * - close dropdown when navigation flyout is opened
 */
define(['jquery', 'matchMedia'], function($, mediaCheck) {
    'use strict';

    return function(mageDropdownDialog) {
        $.widget('mage.dropdownDialog', mageDropdownDialog, {
            _create: function() {
                this._super();
                var _self = this;

                var $navigation = $('.cs-navigation');
                if ($navigation.length) {
                    $navigation.on('mouseenter', function() {
                        if (_self._isOpen) {
                            _self.close();
                        }
                    });
                }
            },
        });

        return $.mage.dropdownDialog;
    };
});
