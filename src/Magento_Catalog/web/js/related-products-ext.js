/**
 * Widget extended to make selectAllLink selector more specific.
 * Otherwise it was looking for [role='button'] element in whole page
 * instead of related products block.
 * Aligned with Magento 2.4.7 in 04/2024
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
