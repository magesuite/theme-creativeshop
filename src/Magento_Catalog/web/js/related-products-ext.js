/**
 * Widget extended to make selectAllLink selector more specific.
 * Otherwise it was looking for [role='button'] element in whole page
 * instead of related products block.
 * Aligned with Magento 2.4.9 in 05/2026
 */

define(['jquery'], function ($) {
    'use strict';

    return function (widget) {
        $.widget('mage.relatedProducts', widget, {
            options: {
                selectAllLink: 'div.block.related[role="button"]',
            },
        });

        return $.mage.relatedProducts;
    };
});
