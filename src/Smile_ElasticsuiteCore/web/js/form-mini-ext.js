/**
 * Elasticsuite search autocomplete extension that allows to search for a phrase
 * before automatic suggestions are loaded.
 */

define(['jquery'], function($) {
    'use strict';
    return function(quickSearch) {
        $.widget('smileEs.quickSearch', quickSearch, {
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

                if (!all) {
                    this.autoComplete.css({
                        minWidth:
                            parseInt(this.autoComplete.css('width'), 10) + 30,
                        width: '',
                    });
                }

                this.searchForm.toggleClass(
                    'active-popup',
                    Boolean(!all && this.responseList.indexList.length)
                );
            },
        });

        return $.smileEs.quickSearch;
    };
});
