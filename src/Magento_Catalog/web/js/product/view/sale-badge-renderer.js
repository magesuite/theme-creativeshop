define(['jquery', 'underscore', 'jquery-ui-modules/widget'], function($, _) {
    'use strict';

    $.widget('magesuite.saleBadgeRenderer', {
        options: {
            discountBadgeSelector: '.cs-page-product__badge--discount',
            discountBadgeValueSelector:
                '.cs-page-product__badge-discount-value',
            discountBadgeTextSelector: '.cs-page-product__badge-discount-text',
            discountsList: {},
            productsIdsSelector: '[data-role=swatch-options]',
            attributesSelector: '.swatch-attribute',
            tileClass: 'cs-product-tile',
        },

        _create: function() {
            this._super();
            this.renderSaleBadge();
        },

        renderSaleBadge: function() {
            this._on(this.element, {
                'click .swatch-option': this.updateSaleBadge.bind(this),
            });
        },

        updateSaleBadge: function() {
            var isTile = this.element.hasClass(this.options.tileClass);

            var allDiscountsList = this.options.discountsList;
            var $element = isTile ? $(this.element) : $(document);

            var $productsIdsIndex = $element
                .find(this.options.productsIdsSelector)
                .data('mageSwatchRenderer').options.jsonConfig.index;

            var selectedProductDiscounts = _.filter(allDiscountsList, function(
                key,
                value
            ) {
                return value in $productsIdsIndex;
            });

            var maximumDiscount = _.max(
                _.values(selectedProductDiscounts, function() {
                    return this;
                })
            );

            var selectedProductId = this.getSelectedProductId();
            var $discountBadge = $element.find(
                this.options.discountBadgeSelector
            );
            var $discountBadgeValue = $element.find(
                this.options.discountBadgeValueSelector
            );
            var $discountBadgeText = $element.find(
                this.options.discountBadgeTextSelector
            );

            var isProductSelected = selectedProductId;

            var selectedProductDiscount = isProductSelected
                ? allDiscountsList[selectedProductId]
                : null;

            // Badge is shown when no product is selected or product has discount.
            // Badge is hidden if product has no discount.

            var displayBadge =
                !isProductSelected ||
                (isProductSelected && selectedProductDiscount !== 0);

            var displayBadgeText = !isProductSelected;

            $discountBadge.toggle(displayBadge);

            $discountBadgeText.toggle(displayBadgeText);

            $discountBadgeValue.text(
                isProductSelected ? selectedProductDiscount : maximumDiscount
            );
        },

        getSelectedProductId: function() {
            var selectedOptions = {};
            var $attributesList = $(this.options.attributesSelector);
            var $productsIdsIndex = $(this.element)
                .find(this.options.productsIdsSelector)
                .data('mageSwatchRenderer').options.jsonConfig.index;

            var productId;

            $($attributesList)
                .filter('[option-selected]')
                .each(function() {
                    var $attribute = $(this);
                    var attributeId = $attribute.attr('attribute-id');
                    var optionSelected = $attribute.attr('option-selected');

                    selectedOptions[attributeId] = optionSelected;
                });

            productId = _.findKey($productsIdsIndex, function(value) {
                return _.isEqual(value, selectedOptions);
            });

            return typeof productId === 'undefined'
                ? 0
                : parseInt(productId, 10);
        },
    });

    return $.magesuite.saleBadgeRenderer;
});
