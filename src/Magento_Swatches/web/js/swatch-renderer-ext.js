/**
 * Origin: Magento_Swatches/.../swatch-renderer.js
 * Modification type: extend
 * List of modifications:
 * - adjust product tile selector
 * - updateBaseImage for product tile
 * - update error message to be more informative and handle clearing this message
 * - update from price label depending on amount of options selected (as an option)
 * - update old price depending if product is discounted (as an option)
 */
define(['jquery', 'mage/translate'], function ($, $t) {
    'use strict';

    return function (swatchRenderer) {
        $.widget('mage.SwatchRenderer', swatchRenderer, {
            options: {
                selectorProductTile: '.cs-product-tile',
                toggleFromPriceLabel: true,
                toggleOldPrice: true,
            },

            /**
             * Change required message to more informative
             */
            _RenderFormInput: function (config) {
                var originalHtml = this._super(config);
                var validationMessage = $t('Please select %1').replace(
                    '%1',
                    config.label
                );

                return originalHtml.replace(
                    'data-validate="{required: true}"',
                    'data-validate="{required: true}" data-msg-required="' +
                        validationMessage +
                        '"'
                );
            },

            /**
             * Extend to update price label depending on amount of options selected
             */
            _UpdatePrice: function () {
                this._super();
                this.updatePriceLabel();
            },
            /**
             * Magento overwrite
             * - We don't want to show oldPrice and style it as special price at all times
             * - Show oldPrice and toggle special-price class only if product is discounted and all options are selected
             * - products with active DailyDeal are excluded from special-price toggle
             * - showOldPrice is an option
             *
             * MageSuite feature
             * - Show 'from' label only when some but not all options are selected
             * - Toggling price label might be turned off for example if shops don't show this label at all ($configurable-products-show-from-price-label)
             * - toggleFromPriceLabel is an option
             */
            updatePriceLabel: function () {
                var optionAmount = this.element.find(
                    '.' + this.options.classes.attributeClass
                ).length;
                var optionSelected = this.element.find(
                    '.' +
                        this.options.classes.attributeClass +
                        '[data-option-selected]'
                ).length;
                var isSimpleProductSelected = optionAmount === optionSelected;
                var $product = this.element.parents(
                    this.options.selectorProduct
                );
                var result = this._getNewPrices();
                var isDiscounted =
                    typeof result !== 'undefined' &&
                    result.oldPrice.amount !== result.finalPrice.amount;
                var isDDActive = $product
                    .find('.product-info-price')
                    .hasClass('cs-price--pdp_dailydeal-countdown');

                $product
                    .find(this.options.slyOldPriceSelector)
                    .toggle(
                        isDiscounted &&
                            isSimpleProductSelected &&
                            this.options.toggleOldPrice
                    );
                $product
                    .find(this.options.selectorProductPrice)
                    .find('span:first')
                    .toggleClass(
                        'special-price',
                        isDDActive
                            ? true
                            : isDiscounted && isSimpleProductSelected
                    );
                $product
                    .find('.normal-price .price-label')
                    .toggle(
                        !isSimpleProductSelected &&
                            this.options.toggleFromPriceLabel
                    );
            },

            /**
             * Overwrite for product tile only - different markup
             * Extend in order to support category_page_grid image size
             *
             * @param {Array} images
             * @param {jQuery} context
             * @param {Boolean} isInProductView
             */
            updateBaseImage: function (images, context, isInProductView) {
                if (isInProductView) {
                    return this._super(images, context, isInProductView);
                }

                var justAnImage = images[0];

                if (justAnImage) {
                    // Use images with sizes for category_page_grid and category_page_grid_x2 if possible
                    var imageSrcSet =
                        justAnImage.tile && justAnImage.tile2x
                            ? `${justAnImage.tile} 1x, ${justAnImage.tile2x} 2x`
                            : justAnImage.img;

                    // Fix updating image for our tile markup
                    if (imageSrcSet) {
                        this.element
                            .parents(this.options.selectorProductTile)
                            .find('.cs-product-tile__image source')
                            .attr('srcset', imageSrcSet)
                            .attr('data-srcset', imageSrcSet);
                    }
                }
            },
        });

        return $.mage.SwatchRenderer;
    };
});
