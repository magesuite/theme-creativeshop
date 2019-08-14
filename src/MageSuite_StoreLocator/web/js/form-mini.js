define([
    'ko',
    'jquery',
    'underscore',
    'Magento_Search/js/form-mini',
    'jquery/ui',
    'mage/translate',
], function(ko, $, _, quickSearch) {
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
                `<b>${originalTextFoundByRegex}</b>`
            );
        });
        return completedString;
    }

    $.widget('magesuite.quickSearch', $.mage.quickSearch, {
        _create: function() {
            this._super();

            this.element.on('blur', () => {
                setTimeout(() => {
                    this._resetResponseList(true);
                    this.autoComplete.hide();
                }, 500);
            });

            this.element.on('keydown', e => {
                var keyCode = e.keyCode || e.which;

                if (keyCode === $.ui.keyCode.ENTER) {
                    this._resetResponseList(true);
                    this.autoComplete.hide();
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
                        query: `{addressAutocomplete(query: "${value}", ) {items {description}}}`,
                    }),
                    contentType: 'application/json',
                }).done(response => {
                    if (!response.data.addressAutocomplete) {
                        response.data.addressAutocomplete = {};
                        response.data.addressAutocomplete.items = [
                            { description: 'fddfd' },
                            { description: 'fdfdwewre' },
                        ];
                    }

                    if (
                        response.data.addressAutocomplete &&
                        response.data.addressAutocomplete.items.length
                    ) {
                        const data = response.data.addressAutocomplete.items;

                        $.each(data, function(index, element) {
                            var html;

                            element.index = index;

                            html = `<li class="cs-store-locator__search-item"><span class="qs-option-name">${highlightMatchesInString(
                                element.description,
                                [value]
                            )}</span></li>`;
                            dropdown.append(html);
                        });

                        this._resetResponseList(true);

                        this.responseList.indexList = this.autoComplete
                            .html(dropdown)
                            .css(clonePosition)
                            .show()
                            .find(
                                this.options.responseFieldElements + ':visible'
                            );

                        this.element.removeAttr('aria-activedescendant');

                        if (this.responseList.indexList.length) {
                            this._updateAriaHasPopup(true);
                        } else {
                            this._updateAriaHasPopup(false);
                        }

                        this.responseList.indexList
                            .on(
                                'click',
                                function(e) {
                                    this.responseList.selected = $(
                                        e.currentTarget
                                    );
                                    this.element.val(
                                        this.responseList.selected
                                            .find('.qs-option-name')
                                            .text()
                                    );
                                    this.searchForm.trigger('submit');
                                    this._resetResponseList(true);
                                    this.autoComplete.hide();
                                }.bind(this)
                            )
                            .on(
                                'mouseenter mouseleave',
                                function(e) {
                                    if (this.responseList.indexList) {
                                        this.responseList.indexList.removeClass(
                                            this.options.selectClass
                                        );
                                        $(e.target).addClass(
                                            this.options.selectClass
                                        );
                                        this.responseList.selected = $(
                                            e.target
                                        );
                                        this.element.attr(
                                            'aria-activedescendant',
                                            $(e.target).attr('id')
                                        );
                                    }
                                }.bind(this)
                            )
                            .on(
                                'mouseout',
                                function(e) {
                                    if (this.responseList.indexList) {
                                        if (
                                            !this._getLastElement() &&
                                            this._getLastElement().hasClass(
                                                this.options.selectClass
                                            )
                                        ) {
                                            $(e.target).removeClass(
                                                this.options.selectClass
                                            );
                                            this._resetResponseList(false);
                                        }
                                    }
                                }.bind(this)
                            );
                    } else {
                        this._resetResponseList(true);
                        this.autoComplete.hide();
                        this._updateAriaHasPopup(false);
                        this.element.removeAttr('aria-activedescendant');
                    }
                });
            } else {
                this._resetResponseList(true);
                this.autoComplete.hide();
                this._updateAriaHasPopup(false);
                this.element.removeAttr('aria-activedescendant');
            }
        },
    });

    return $.magesuite.quickSearch;
});
