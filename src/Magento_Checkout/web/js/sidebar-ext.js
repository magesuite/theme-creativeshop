define([
    'jquery',
    'Magento_Ui/js/modal/confirm',
    'Magento_Customer/js/model/authentication-popup',
    'Magento_Customer/js/customer-data',
], function($, confirm, authenticationPopup, customerData) {
    'use strict';

    return function(config) {
        return $.widget('mage.sidebar', $.mage.sidebar, {
            options: {
                item: {
                    qtyDecrease: '.cs-qty-increment__button--decrement',
                    qtyIncrease: '.cs-qty-increment__button--increment',
                },
                useDefaultQty: null,
                delay: 1500,
                step: 1,
                minValue: 1,
            },
            _initContent: function() {
                var self = this;
                var events = {};

                this.element.decorate('list', this.options.isRecursive);

                /**
                 * @param {jQuery.Event} event
                 */
                events['click ' + this.options.button.close] = function(event) {
                    event.stopPropagation();
                    $(self.options.targetElement).dropdownDialog('close');
                };
                events['click ' + this.options.button.checkout] = $.proxy(
                    function() {
                        var cart = customerData.get('cart');
                        var customer = customerData.get('customer');
                        var element = $(this.options.button.checkout);

                        if (
                            !customer().firstname &&
                            cart().isGuestCheckoutAllowed === false
                        ) {
                            // set URL for redirect on successful login/registration. It's postprocessed on backend.
                            $.cookie(
                                'login_redirect',
                                this.options.url.checkout
                            );

                            if (this.options.url.isRedirectRequired) {
                                element.prop('disabled', true);
                                location.href = this.options.url.loginUrl;
                            } else {
                                authenticationPopup.showModal();
                            }

                            return false;
                        }
                        element.prop('disabled', true);
                        location.href = this.options.url.checkout;
                    },
                    this
                );

                /**
                 * @param {jQuery.Event} event
                 */
                events['click ' + this.options.button.remove] = function(
                    event
                ) {
                    var removedElementQtyInput = $(event.currentTarget)
                        .parents('.actions')
                        .find('.item-qty')
                        .eq(0);

                    if (!removedElementQtyInput) {
                        return;
                    }

                    event.stopPropagation();
                    confirm({
                        content: self.options.confirmMessage,
                        actions: {
                            /** @inheritdoc */
                            confirm: function() {
                                self._removeItem($(event.currentTarget));
                            },

                            /** Add support for removing item by setting Qty = 0,
                             *  but set Qty = minVal if user decide to not remove the item on the level of modal confirmation
                             */
                            cancel: function() {
                                if (
                                    removedElementQtyInput.val() <
                                    self.options.minValue
                                ) {
                                    removedElementQtyInput.val(
                                        `${self.options.minValue}`
                                    );
                                }
                            },

                            /** @inheritdoc */
                            always: function(e) {
                                e.stopImmediatePropagation();
                            },
                        },
                    });
                };

                /**
                 * @param {jQuery.Event} event
                 */
                events['keyup ' + this.options.item.qty] = function(event) {
                    self._showItemButton($(event.target));
                };

                /**
                 * @param {jQuery.Event} event
                 */
                events['change ' + this.options.item.qty] = function(event) {
                    self._showItemButton($(event.target));
                };

                /**
                 * @param {jQuery.Event} event
                 */
                events['click ' + this.options.item.button] = function(event) {
                    event.stopPropagation();
                    self._updateItemQty($(event.currentTarget));
                };

                /**
                 * @param {jQuery.Event} event
                 */
                events['focusout ' + this.options.item.qty] = function(event) {
                    self._validateQty($(event.currentTarget));
                };

                this._on(this.element, events);
                this._calcHeight();

                this.options.useDefaultQty =
                    $('.cs-minicart__wrapper').attr('usedefaultqty') === 'true';

                if (this.options.useDefaultQty !== true) {
                    this._addQtyButtonsEvents();
                }
            },
            _addQtyButtonsEvents: function() {
                var events = {};

                events['click ' + this.options.item.qtyDecrease] = function(
                    event
                ) {
                    this._addQtyButtonAction(event, 'qtyDecrease');
                };

                events['click ' + this.options.item.qtyIncrease] = function(
                    event
                ) {
                    this._addQtyButtonAction(event, 'qtyIncrease');
                };

                this._on(this.element, events);
            },
            _addQtyButtonAction: function(event, action) {
                event.stopPropagation();
                var itemId = $(event.currentTarget).data('cart-item');
                var qtyElement = $('#cart-item-' + itemId + '-qty');
                var qtyValue = parseInt(qtyElement.val(), 10);

                if (
                    qtyValue === this.options.minValue &&
                    action === 'qtyDecrease'
                ) {
                    this._triggerRemove($(event.currentTarget));

                    return;
                }

                qtyValue =
                    action === 'qtyDecrease'
                        ? Math.max(
                              qtyValue - this.options.step,
                              this.options.minValue
                          )
                        : qtyValue + this.options.step;
                qtyElement.val(qtyValue).trigger('keyup');
            },

            _validateQty: function(elem) {
                if (parseInt(elem.val(), 10) < this.options.minValue) {
                    this._triggerRemove($(elem));

                    return;
                } else {
                    this._super(elem);
                }
            },

            _triggerRemove: function(elem) {
                const deleteTrigger = elem
                    .parents('.product-item')
                    .find('a.action.delete')
                    .eq(0);

                if (deleteTrigger) {
                    deleteTrigger.trigger('click');
                }
            },

            _showItemButton: function(elem) {
                if (this.options.useDefaultQty === true) {
                    this._super(elem);
                } else {
                    var that = this;
                    var itemId = elem.data('cart-item');
                    var itemQty = elem.data('item-qty');
                    var updateItemButton = $('#update-cart-item-' + itemId);
                    var loadIndicator = $(
                        '.cs-minicart__content .load.indicator'
                    );

                    if (that._isValidQty(itemQty, elem.val())) {
                        setTimeout(function() {
                            loadIndicator.removeClass('cs-no-display');
                            setTimeout(function() {
                                updateItemButton.click();
                                loadIndicator.addClass('cs-no-display');
                            }, that.options.delay);
                        }, that.options.delay);
                    }
                }
            },
        });
    };
});
