/**
 * Copyright 2016 aheadWorks. All rights reserved.
 * See LICENSE.txt for license details.
 */

define([
    'jquery',
    './filter/value',
    './filter/item/current',
    './url',
    './filter/data/source/ajax',
    './filter/request/bridge',
    './updater'
], function ($, filterValue, currentFilterItem, url, dataSource, requestBridge, updater) {
    'use strict';

    $.widget('mage.awLayeredNavPopover', {
        options: {
            buttonShow: '[data-role=show-button]',
            itemsCountContainer: '[data-role=items-count-container]',
            filtersContainer: '[data-role=filters-container]',
            isPopoverDisabled: false,
            hasActiveFilters: false,
            actionsBlock: '[data-role=aw-layered-nav-actions]'
        },

        /**
         * Initialize widget
         */
        _create: function () {
            this.element.hide();
            this._bind();
            if (filterValue.getPrepared().length && currentFilterItem.get()) {
                this._updatePopoverData(filterValue.getPrepared());
                this._moveToFilterItem(currentFilterItem.get());
            }
        },

        /**
         * Event binding
         */
        _bind: function () {
            this.element.on('awLayeredNav:filterValueChange', $.proxy(this._onFilterValueChange, this));
            this.element.on('awLayeredNav:filterItemClick', $.proxy(this._onFilterItemClick, this));
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },

        /**
         * On filter value change event handler
         *
         * @param {Event} event
         * @param {Array} filterValue
         */
        _onFilterValueChange: function (event, filterValue) {
            if (currentFilterItem.get()) {
                if (this.options.isPopoverDisabled) {
                    var submitUrl = url.getSubmitUrl(filterValue);

                    requestBridge.submit(submitUrl).then(
                        /**
                         * Called after request finishes
                         */
                        function () {
                            updater.update(submitUrl, requestBridge.getResult());
                        }
                    );
                } else {
                    this._updatePopoverData(filterValue);
                }
            }
        },

        /**
         * On filter item click event handler
         *
         * @param {Event} event
         * @param {Object} filterItem
         */
        _onFilterItemClick: function (event, filterItem) {
            if (!this.options.isPopoverDisabled) {
                this._moveToFilterItem(filterItem);
            }
        },

        /**
         * On window resize event handler
         */
        _onWindowResize: function () {
            if (currentFilterItem.get()) {
                this._moveToFilterItem(currentFilterItem.get());
            }
        },

        /**
         * Update popover data
         *
         * @param {Array} filterValue
         */
        _updatePopoverData: function (filterValue) {
            var self = this,
                buttonShow =  this.element.find(this.options.buttonShow);

            this.element.addClass('aw-layered-nav-popover--loading');
            this._disableShowButton();
            dataSource.fetchPopoverData(filterValue).then(
                function () {
                    var popoverData = dataSource.getResult();

                    self.element.find(self.options.itemsCountContainer).html(popoverData.itemsContent);
                    self.element.removeClass('aw-layered-nav-popover--loading');
                    if (popoverData.itemsCount && (filterValue.length || self.options.hasActiveFilters)) {
                        buttonShow.one('click', function () {
                            var submitUrl = url.getSubmitUrl(filterValue);

                            requestBridge.submit(submitUrl).then(
                                /**
                                 * Called after request finishes
                                 */
                                function () {
                                    updater.update(submitUrl, requestBridge.getResult());
                                }
                            );
                        });
                        self._enableShowButton();
                    }
                }
            );
        },

        /**
         * Disable Show button
         */
        _disableShowButton: function() {
            var buttonShow =  this.element.find(this.options.buttonShow);

            buttonShow.addClass('disabled');
            $(this.options.actionsBlock).trigger('awLayeredNav:showActionDisabled');
        },

        /**
         * Enable Show button
         */
        _enableShowButton: function () {
            var buttonShow =  this.element.find(this.options.buttonShow);

            buttonShow.removeClass('disabled');
            $(this.options.actionsBlock).trigger('awLayeredNav:showActionEnabled');
        },

        /**
         * Move popover to target filter item
         *
         * @param {Object} filterItem
         */
        _moveToFilterItem: function (filterItem) {
            var position = 'left',
                width = $(this.options.filtersContainer).width() + 35,
                top = filterItem.offset().top - $('#layered-filter-block').offset().top;

            if ($('body').hasClass('page-layout-2columns-right')) {
                position = 'right';
            }

            this.element.css(position, width + 'px');
            this.element.css('top',top + 'px');
            this.element.show();
        }
    });

    return $.mage.awLayeredNavPopover;
});
