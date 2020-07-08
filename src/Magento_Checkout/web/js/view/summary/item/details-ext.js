define(['underscore'], function(_) {
    'use strict';

    var quoteItemData = window.checkoutConfig.quoteItemData;

    var mixin = {
        quoteItemData: quoteItemData,
        getBrand: function(quoteItem) {
            var itemId = parseInt(quoteItem.item_id, 10);
            var item = this.getItem(itemId);

            return item ? item.product_brand : '';
        },
        getItem: function(itemId) {
            return _.find(this.quoteItemData, function(element) {
                return parseInt(element.item_id, 10) === itemId;
            });
        },
    };

    return function(target) {
        return target.extend(mixin);
    };
});
