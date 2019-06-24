define(['jquery'], function($) {
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
                this._super();
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
                qtyValue =
                    action === 'qtyDecrease'
                        ? Math.max(
                              qtyValue - this.options.step,
                              this.options.minValue
                          )
                        : qtyValue + this.options.step;
                qtyElement.val(qtyValue).trigger('keyup');
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
