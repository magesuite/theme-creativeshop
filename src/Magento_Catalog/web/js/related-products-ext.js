/**
 * Widget extended to make selectAllLink selector more specific.
 * Otherwise it was looking for [role='button'] element in whole page
 * instead of related products block.
 */

define(['jquery'], function($) {
    'use strict';

    return function(widget) {
        $.widget('mage.relatedProducts', widget, {
            options: {
                selectAllLink: 'div.block.related[role="button"]',
            },
        });

        return $.mage.relatedProducts;
    };
});
