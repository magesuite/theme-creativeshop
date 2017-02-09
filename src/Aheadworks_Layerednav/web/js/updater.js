/**
* Copyright 2016 aheadWorks. All rights reserved.
* See LICENSE.txt for license details.
*/

define([
    'jquery',
    'bundle',
    './filter/value',
    './filter/item/current',
    './url'
], function ($, bundle, filterValue, currentFilterItem, url) {
    'use strict';

    return {
        config: {
            mainColumn: 'div.column.main',
            navigation: '[data-role=filter-block]'
        },

        /**
         * Initialize
         *
         * @param {Object} config
         */
        init: function (config) {
            $.extend(this.config, config);
        },

        /**
         * Performs update blocks and window url
         *
         * @param {String} windowUrl
         * @param {Object} blocksHtml
         */
        update: function (windowUrl, blocksHtml) {
            if (blocksHtml) {
                var mainColumnHtml = blocksHtml.mainColumn,
                    navigationHtml = blocksHtml.navigation;

                $(this.config.mainColumn).replaceWith(mainColumnHtml);
                $(this.config.mainColumn).trigger('contentUpdated');

                $(this.config.navigation).replaceWith(navigationHtml);
                filterValue.reset();
                currentFilterItem.reset();
                $(this.config.navigation).trigger('contentUpdated');

                this._setCurrentUrl(windowUrl);

                /* CS modification starts here */
                    new bundle.Select( $(this.config.mainColumn).find( '.cs-select' ) );
                /* CS modification ends here */
            }
        },

        /**
         * Set current url
         *
         * @param {String} windowUrl
         */
        _setCurrentUrl: function (windowUrl) {
            url.setCurrentUrl(windowUrl);
            if (typeof(window.history.pushState) == 'function') {
                window.history.pushState(null, url.getCurrentUrl(), url.getCurrentUrl());
            } else {
                window.location.hash = '#!' + url.getCurrentUrl();
            }
        }
    };
});
