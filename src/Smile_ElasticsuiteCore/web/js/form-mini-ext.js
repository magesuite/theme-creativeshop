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
                    this._super(event);
                }
                this.searchForm.trigger('submit');
            },
        });

        return $.smileEs.quickSearch;
    };
});
