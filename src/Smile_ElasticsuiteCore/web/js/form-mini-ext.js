/**
 * Elasticsuite search autocomplete extension that allows to search for a phrase
 * before automatic suggestions are loaded.
 */

define(['jquery'], function($) {
    'use strict';
    return function(quickSearch) {
        $.widget('smileEs.quickSearch', quickSearch, {
            _create: function() {
                var self = this;
                this._super();

                // Blur handle is added twice, first in original Magento widget,
                // then in smile mixin
                // We want to be sure that we add our custom blur handle only once and remove other handles
                this.element.off('blur'),
                this._blur();

                $('body').on('click', function(event) {
                    if (!$(event.target).closest(this.autoComplete).length) {
                        self._resetResponseList(true);
                        self.autoComplete.hide();
                    }
                });

                this.isTouchDevice = this._isTouchDevice();
            },
            _isTouchDevice() {
                return (('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0) ||
                   (navigator.msMaxTouchPoints > 0));
            },
            _getSectionHeader: function(type, data) {
                var header = this._super(type, data);

                if (type !== undefined) {
                    header.addClass(type);
                }

                return header;
            },
            /**
             * Validate selection of an element (eg : when ENTER is pressed)
             *
             * @param event The keydown event
             *
             * @returns {boolean}
             *
             * @private
             */
            _validateElement: function(event) {
                // Invoke original method only if autosuggest is already loaded.
                if (this.responseList.selected) {
                    return this._super(event);
                }
                this.searchForm.trigger('submit');
            },
            _resetResponseList: function(all) {
                this._super(all);

                var minWidth = all
                    ? ''
                    : parseInt(this.element.outerWidth(), 10);
                this.autoComplete.css({
                    minWidth: minWidth,
                    width: '',
                });

                this.searchForm.toggleClass(
                    'active-popup',
                    Boolean(!all && this.responseList.indexList.length)
                );
            },
            /**
             * Override blur event handle in order to not close autocomplete on touch devices
             * When native keyboard is closed input can be focused out 
             * which make impossible to choose item from autocomplete list.
             * To close autocomplete on touch device click outside autocomplete can be used 
             * as well as click on cs-header-search__close which hides whole search
             */
            _blur: function() {
                this.element.on('blur', $.proxy(function (e) {
                    if (!this.searchLabel.hasClass('active')) {
                        return;
                    }
                    setTimeout($.proxy(function () {
                        if (this.isTouchDevice) {
                            this.element.trigger('focus');
                            this.setActiveState(true);
                            return;
                        };

                        if (this.autoComplete.is(':hidden')) {
                            this.setActiveState(false);
                        } else {
                            this.element.trigger('focus');
                        }
                        this.autoComplete.hide();
                        $('#search').blur();
                        this._updateAriaHasPopup(false);
                    }, this),250);
                }, this));
            }
        });

        return $.smileEs.quickSearch;
    };
});
