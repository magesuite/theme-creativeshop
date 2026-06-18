/**
 * Origin: Native M2 Collapsible Widget
 * Modification type: extend
 * Reasons:
 * - [1] close dropdown when navigation flyout is opened
 * - [2] provide proper aria-label for dropdown dialog due to accessibility reasons:
 *   * dropdown dialog content should have element with "data-labelledby='true'" attribute and "id",
 *     then "id" value will be used as "aria-labelledby" attribute for dialog element
 *   * if there is no element with "data-labelledby" attribute, then default "aria-label" attribute will be used
 *   * if dialogTitle is specified, it's value will be used as "aria-label" attribute
 * - [3] remove unwanted "tabindex = -1" attribute from dialog element when it is being added to DOM
 * - [4] generate unique id for dropdown dialog element if it does not have one
 * - [5] introduced option "removeAccessibilityAttributes" to remove all accessibility attributes from dialog element
 *       as we are using custom dialog (offcanvas) implementation
 *
 * Aligned with Magento 2.4.8 on 05/2025
 */
define(['jquery', 'mage/translate'], function ($, $t) {
    'use strict';

    return function (mageDropdownDialog) {
        $.widget('mage.dropdownDialog', mageDropdownDialog, {
            options: {
                /** edit [5] start */
                removeAccessibilityAttributes: false,
                /** edit [5] end */
            },
            _create: function () {
                /** edit [4] start */
                const uniqueId = 'ui-id-' + Math.random().toString(36).substr(2, 9);

                if (!this.element.attr('id')) {
                    this.element.attr('id', uniqueId);
                }
                /** edit [4] end */

                this._super();
                const _self = this;

                /** edit [1] start */
                const $navigation = $('.cs-navigation');
                if ($navigation.length) {
                    $navigation.on('mouseenter', function () {
                        if (_self._isOpen) {
                            _self.close();
                        }
                    });
                }
                /** edit [1] end */
            },

            _createWrapper: function () {
                this._super();

                /** edit [3] start */
                this.uiDialog.removeAttr('tabindex');
                /** edit [3] end */

                /** edit [2] start */
                const labelElement = this.element.find('[data-labelledby]');
                const ariaAttributes = labelElement.length
                    ? { 'aria-labelledby': labelElement.attr('id') }
                    : { 'aria-label': $t('Dropdown dialog') };

                this.uiDialog.attr(ariaAttributes);
                /** edit [2] end */

                /** edit [5] start */
                if (this.options.removeAccessibilityAttributes) {
                    this.uiDialog
                        .removeAttr('aria-labelledby')
                        .removeAttr('aria-describedby')
                        .removeAttr('role');
                }
                /** edit [5] end */
            },
        });

        return $.mage.dropdownDialog;
    };
});
