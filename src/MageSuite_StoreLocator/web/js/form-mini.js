define([
    'jquery',
    'underscore',
    'Magento_Search/js/form-mini',
    'jquery-ui-modules/widget',
    'mage/translate',
], function($, _, quickSearch) {
    'use strict';

    /**
     * Check whether the incoming string is not empty or if doesn't consist of spaces.
     *
     * @param {String} value - Value to check.
     * @returns {Boolean}
     */
    function isEmpty(value) {
        return value.length === 0 || value == null || /^\s+$/.test(value);
    }

    function highlightMatchesInString(string, query) {
        // The completed string will be itself if already set, otherwise, the string that was passed in
        var completedString = completedString || string;
        query.forEach(function(item) {
            var reg = '(' + item + ')(?![^<]*>|[^<>]*</)'; // explanation: http://stackoverflow.com/a/18622606/1147859
            var regex = new RegExp(reg, 'i');
            // If the regex doesn't match the string just exit
            if (!string.match(regex)) {
                return;
            }
            // Otherwise, get to highlighting
            var matchStartPosition = string.match(regex).index;
            var matchEndPosition =
                matchStartPosition + string.match(regex)[0].toString().length;
            var originalTextFoundByRegex = string.substring(
                matchStartPosition,
                matchEndPosition
            );
            completedString = completedString.replace(
                regex,
                '<b>' + originalTextFoundByRegex + '</b>'
            );
        });
        return completedString;
    }

    $.widget('magesuite.quickSearch', $.mage.quickSearch, {
        _create: function() {
            this._super();

            var _this = this;

            this.element.on('blur', function() {
                setTimeout(function() {
                    _this._resetResponseList(true);
                    _this.autoComplete.hide();
                }, 500);
            });

            this.element.on('keydown', function(e) {
                var keyCode = e.keyCode || e.which;

                if (keyCode === $.ui.keyCode.ENTER) {
                    _this._resetResponseList(true);
                    _this.autoComplete.hide();
                }
            });
        },

        /**
         * Executes when the value of the search input field changes. Executes a GET request
         * to populate a suggestion list based on entered text. Handles click (select), hover,
         * and mouseout events on the populated suggestion list dropdown.
         *
         * Overriden to :
         *  - get graphql response by post method
         *  - display custom dropdown html
         *
         * @private
         */
        _onPropertyChange: function() {
            var _this = this;
            var searchField = this.element;
            var clonePosition = {
                top: searchField.outerHeight(),
                width: searchField.outerWidth(),
            };

            var dropdown = $(
                '<ul role="listbox" class="cs-store-locator__search-list"></ul>'
            );
            var value = this.element.val();

            this.submitBtn.disabled = isEmpty(value);

            if (value.length >= parseInt(this.options.minSearchLength, 10)) {
                $.post({
                    url: this.options.url,
                    data: JSON.stringify({
                        query:
                            '{addressAutocomplete(query: "' +
                            value +
                            '", ) {items {description}}}',
                    }),
                    contentType: 'application/json',
                }).done(function(response) {
                    if (
                        response.data.addressAutocomplete &&
                        response.data.addressAutocomplete.items.length
                    ) {
                        var data = response.data.addressAutocomplete.items;

                        $.each(data, function(index, element) {
                            var html;

                            element.index = index;

                            html =
                                '<li class="cs-store-locator__search-item"><span class="qs-option-name">' +
                                highlightMatchesInString(element.description, [
                                    value,
                                ]) +
                                '</span></li>';
                            dropdown.append(html);
                        });

                        _this._resetResponseList(true);

                        _this.responseList.indexList = _this.autoComplete
                            .html(dropdown)
                            .css(clonePosition)
                            .show()
                            .find(
                                _this.options.responseFieldElements + ':visible'
                            );

                        _this.element.removeAttr('aria-activedescendant');

                        if (_this.responseList.indexList.length) {
                            _this._updateAriaHasPopup(true);
                        } else {
                            _this._updateAriaHasPopup(false);
                        }

                        _this.responseList.indexList
                            .on(
                                'click',
                                function(e) {
                                    _this.responseList.selected = $(
                                        e.currentTarget
                                    );
                                    _this.element.val(
                                        _this.responseList.selected
                                            .find('.qs-option-name')
                                            .text()
                                    );
                                    _this.searchForm.trigger('submit');
                                    _this._resetResponseList(true);
                                    _this.autoComplete.hide();
                                }.bind(_this)
                            )
                            .on(
                                'mouseenter mouseleave',
                                function(e) {
                                    if (_this.responseList.indexList) {
                                        _this.responseList.indexList.removeClass(
                                            _this.options.selectClass
                                        );
                                        $(e.target).addClass(
                                            _this.options.selectClass
                                        );
                                        _this.responseList.selected = $(
                                            e.target
                                        );
                                        _this.element.attr(
                                            'aria-activedescendant',
                                            $(e.target).attr('id')
                                        );
                                    }
                                }.bind(_this)
                            )
                            .on(
                                'mouseout',
                                function(e) {
                                    if (_this.responseList.indexList) {
                                        if (
                                            !_this._getLastElement() &&
                                            _this
                                                ._getLastElement()
                                                .hasClass(
                                                    _this.options.selectClass
                                                )
                                        ) {
                                            $(e.target).removeClass(
                                                _this.options.selectClass
                                            );
                                            _this._resetResponseList(false);
                                        }
                                    }
                                }.bind(_this)
                            );
                    } else {
                        _this._resetResponseList(true);
                        _this.autoComplete.hide();
                        _this._updateAriaHasPopup(false);
                        _this.element.removeAttr('aria-activedescendant');
                    }
                });
            } else {
                _this._resetResponseList(true);
                _this.autoComplete.hide();
                _this._updateAriaHasPopup(false);
                _this.element.removeAttr('aria-activedescendant');
            }
        },
    });

    return $.magesuite.quickSearch;
});
