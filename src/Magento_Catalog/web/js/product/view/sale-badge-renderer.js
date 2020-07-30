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
            buyBoxSelector: '.cs-buybox',
            tileSelector: '.cs-product-tile',
            isInTile: false,
        },

        $tileOrBuybox: null,

        _create: function() {
            this._super();

            var $element = $(this.element);
            this.$tileOrBuybox = $element;

            if (!$element.is(this.options.buyBoxSelector)) {
                this.options.isInTile = true;
                this.$tileOrBuybox = $element.closest(
                    this.options.tileSelector
                );
            }

            this.renderSaleBadge();
        },

        renderSaleBadge: function() {
            this._on(this.$tileOrBuybox, {
                'click .swatch-option': this.updateSaleBadge.bind(this),
            });
        },

        updateSaleBadge: function() {
            var allDiscountsList = this.options.discountsList;
            var $rootElement = this.options.isInTile
                ? this.$tileOrBuybox
                : $(document);
            var $productsIdsIndex = $rootElement
                .find(this.options.productsIdsSelector)
                .data('mageSwatchRenderer').options.jsonConfig.index;

            var selectedProductDiscounts = _.filter(allDiscountsList, function(
                key,
                value
            ) {
                return $productsIdsIndex[value];
            });

            var maximumDiscount = Math.max.apply(
                null,
                selectedProductDiscounts
            );

            var selectedProductId = this.getSelectedProductId();

            var $discountBadge = $rootElement.find(
                this.options.discountBadgeSelector
            );
            var $discountBadgeValue = $rootElement.find(
                this.options.discountBadgeValueSelector
            );
            var $discountBadgeText = $rootElement.find(
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
            var $attributesList = this.$tileOrBuybox.find(
                this.options.attributesSelector
            );
            var $productsIdsIndex = this.$tileOrBuybox
                .find(this.options.productsIdsSelector)
                .data('mageSwatchRenderer').options.jsonConfig.index;

            var productId;

            $($attributesList)
                .filter('[data-option-selected]')
                .each(function() {
                    var $attribute = $(this);
                    var attributeId = $attribute.attr('data-attribute-id');
                    var optionSelected = $attribute.attr(
                        'data-option-selected'
                    );

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
