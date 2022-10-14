/* tslint:disable one-variable-per-declaration */

/**
 * Origin: Magento swatch renderer
 * Modification type: extend
 * Reason:
 * To add selecting swatches based on selected filters (by referrer url).
 * Prevent to duplicate swatches on tile
 * Swatches can be selected only after:
 * - gallery is loaded, to keep correct gallery behaviour
 * - attributes config is prepared by widget logic
 */
define(['jquery', 'underscore', 'mage/translate'], function ($, _, $t) {
    'use strict';

    return function (swatchRenderer) {
        $.widget('mage.SwatchRenderer', swatchRenderer, {
            options: {
                selectorProductTile: '.cs-product-tile',
                selectorPdp: '.cs-buybox',
                swatchesWrapper: '.swatch-attribute-options',
                normalPriceLabel: '.normal-price .price-label',
                isPdp: false,
                hideFromPriceLabels: true,
                hideOldPrice: false,
                $tileOrBuybox: null,
                buyBoxSelector: '.cs-buybox',
                isInTile: false,
                tileSelector: '.cs-product-tile',

                classes: {
                    productTileClass: 'cs-product-tile',
                    pdpClass: 'cs-buybox',
                },
            },
            _init: function () {
                if (!this.options.$tileOrBuybox) {
                    var isPdp = this.element.parents(this.options.selectorPdp)
                        .length
                        ? true
                        : false;

                    this.options.isPdp = isPdp;

                    if (!isPdp) {
                        this.options.isInTile = true;
                        this.options.$tileOrBuybox = this.element.closest(
                            this.options.tileSelector
                        );
                    } else {
                        this.options.$tileOrBuybox = this.element.parents(
                            this.options.selectorPdp
                        );
                    }
                }

                if (this.element.attr('data-rendered')) {
                    return;
                }

                this._super();
            },
            _onGalleryLoaded: function (gallery) {
                this._super(gallery);

                // Add gallery loaded flag for selecting swatches reference
                this._isGalleryLoaded = true;
            },
            _determineProductData: function () {
                // Check if product is in a list of products.
                var productId,
                    isInProductView = false;

                // Fixed element extraction for our markup.
                productId = this.element
                    .parents(this.options.selectorProductTile)
                    .find('.price-box.price-final_price')
                    .attr('data-product-id');

                if (!productId) {
                    // Check individual product.
                    productId = $('[name=product]').val();
                    isInProductView = productId > 0;
                }

                return {
                    productId: productId,
                    isInProductView: isInProductView,
                };
            },
            updateBaseImage: function (images, context, isInProductView) {
                var justAnImage = images[0];

                if (isInProductView) {
                    return this._super(images, context, isInProductView);
                }

                // Fixed element extraction for our markup.
                if (justAnImage) {
                    // Use images with sizes for category_page_grid and category_page_grid_x2 if possible
                    var imageSrcSet =
                        justAnImage.tile && justAnImage.tile2x
                            ? `${justAnImage.tile} 1x, ${justAnImage.tile2x} 2x`
                            : justAnImage.img;

                    if (imageSrcSet) {
                        this.element
                            .parents(this.options.selectorProductTile)
                            .find('.cs-product-tile__image source')
                            .attr('srcset', imageSrcSet)
                            .attr('data-srcset', imageSrcSet);
                    }
                }
            },
            _RenderControls: function () {
                this._super();
                var _this = this;
                var gallery = $(
                    '[data-gallery-role=gallery-placeholder]',
                    '.column.main'
                );

                // If gallery is already loaded, select swatches bases on referrer or select single swatch
                // otherwise wait for 'gallery:loaded' event
                if (_this._isGalleryLoaded === true) {
                    _this._SelectSwatchesBasedOnReferrer();

                    $.each(
                        _this.options.jsonConfig.attributes,
                        function (index, item) {
                            if (item.options.length === 1) {
                                _this._checkOption(
                                    item.code,
                                    item.options[0].id
                                );
                            }
                        }
                    );
                }

                $(gallery).on('gallery:loaded', function () {
                    _this._SelectSwatchesBasedOnReferrer();

                    var optionsWithoutDisabledProducts =
                        _this.options.jsonConfig.attributes.map(function (
                            currentValue,
                            index,
                            array
                        ) {
                            currentValue.options = currentValue.options.filter(
                                function (element, index, array) {
                                    return element.products.length > 0;
                                }
                            );

                            return currentValue;
                        });

                    var optionsWithSingleSwatch =
                        optionsWithoutDisabledProducts.filter(function (
                            element,
                            index,
                            array
                        ) {
                            return element.options.length === 1;
                        });

                    $.each(optionsWithSingleSwatch, function (index, item) {
                        _this._checkOption(item.code, item.options[0].id);
                    });
                });
            },
            _SelectSwatchesBasedOnReferrer: function () {
                var _this = this;

                if (!_this.element.parents('.cs-buybox').length) {
                    return;
                }

                var referrerQueryString = document.referrer.substring(
                    document.referrer.indexOf('?') + 1
                );

                // Do nothing if there is no query string or configred attributes
                if (
                    !(
                        referrerQueryString.length &&
                        $.isArray(_this.options.jsonConfig.attributes)
                    )
                ) {
                    return;
                }

                var searchParams = {};

                $.each(referrerQueryString.split('&'), function (index, item) {
                    var split = item.split('=');
                    var key = split[0] && decodeURIComponent(split[0]);
                    var value = split[1] && decodeURIComponent(split[1]);

                    (searchParams[key] = searchParams[key] || []).push(value);
                });

                // Reduce swatches config to have just option labels and IDs
                var swatches = _this.options.jsonConfig.attributes.reduce(
                    function (acc, swatch) {
                        acc[swatch.code] = acc[swatch.code] || {};

                        $.each(swatch.options, function (index, option) {
                            acc[swatch.code][option.label] = option.id;
                        });

                        return acc;
                    },
                    {}
                );

                $.each(Object.keys(searchParams), function (index, key) {
                    // Take the first value of the param
                    var value = searchParams[key][0];

                    // Check if search param contains an optionId for any of configured swatches
                    var optionId =
                        swatches[key] && swatches[key][value]
                            ? swatches[key][value]
                            : null;

                    if (!optionId) {
                        return;
                    }

                    _this._checkOption(key, optionId);
                });
            },
            _checkOption: function (key, optionId) {
                var _this = this;

                if (!_this.element.parents('.cs-buybox').length) {
                    return;
                }

                // Select swatches based on attributeCode and optionId
                var $option = _this.element.find(
                    '.' +
                        _this.options.classes.attributeClass +
                        '[attribute-code="' +
                        key +
                        '"] [option-id="' +
                        optionId +
                        '"]'
                );

                if ($option.length) {
                    var $parentInput = $option.parent();

                    if ($option.hasClass('selected')) {
                        return;
                    }

                    if (
                        $parentInput.hasClass(_this.options.classes.selectClass)
                    ) {
                        $parentInput.val(optionId);
                        $parentInput.trigger('change');
                    } else {
                        $option.trigger('click');
                    }
                }
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
                    'data-validate="{required: true, messages:{required:\'' +
                        validationMessage +
                        '\'}}"'
                );
            },
            _UpdatePrice: function () {
                this._super();

                var $widget = this;
                var options = _.object(_.keys(this.optionsMap), {});
                var element = this.element;
                var $product = $widget.element.parents(
                    $widget.options.selectorProduct
                );
                var $productPrice = $product.find(
                    this.options.selectorProductPrice
                );

                var isPdp = this.options.isPdp;
                var currentTileSwatchesClass = element.attr('class');

                this.options.classes.attributeOptionsWrapper = isPdp
                    ? this.options.classes.pdpClass +
                      ' ' +
                      this.options.swatchesWrapper
                    : this.options.classes.productTileClass +
                      ' ' +
                      '.' +
                      currentTileSwatchesClass +
                      ' ';
                this.options.swatchesWrapper;

                this.options.normalPriceLabelSelector = isPdp
                    ? $(
                          this.options.selectorPdp +
                              ' ' +
                              this.options.normalPriceLabel
                      )
                    : $(element)
                          .closest(this.options.selectorProductTile)
                          .find(this.options.normalPriceLabel);

                element
                    .find(
                        '.' +
                            this.options.classes.attributeClass +
                            '[data-option-selected]'
                    )
                    .each(function () {
                        var attributeId = $(this).attr('attribute-id');

                        options[attributeId] = $(this).attr(
                            'data-option-selected'
                        );
                    });

                var result = $widget._getPrices(
                    $widget._getNewPrices(),
                    $productPrice.priceBox('option').prices
                );
                var discounted =
                    typeof result !== 'undefined' &&
                    result.basePrice.amount === 0;

                $productPrice
                    .find('.price-final_price')
                    .toggleClass('special-price', discounted);

                $widget._UpdateTilePriceLabel();
            },

            // Toggle price labels
            _UpdateTilePriceLabel: function () {
                var swatchesAmount =
                    this.options.$tileOrBuybox.find('.swatch-attribute').length;
                var swatchesSelected = this.options.$tileOrBuybox.find(
                    '.swatch-attribute[data-option-selected]'
                ).length;

                var isProductSelected = swatchesAmount === swatchesSelected;

                // Hide 'From' price label on all tiles except clicked one
                if (this.options.hideFromPriceLabels) {
                    var $tileNormalPriceLabelSelector = $(
                        this.options.selectorProductTile +
                            ' ' +
                            this.options.normalPriceLabel
                    );

                    var $tilePriceLabel = $(
                        this.element
                            .closest($(this.options.selectorProductTile))
                            .find($tileNormalPriceLabelSelector)
                    );

                    $tileNormalPriceLabelSelector.not($tilePriceLabel).hide();
                } else {
                    // Keep 'from' price label always visible for configurable products
                    var $fromPriceLabel = this.options.$tileOrBuybox.find(
                        '.price-box .normal-price .price-label'
                    );

                    $fromPriceLabel.toggle(!isProductSelected);
                }

                // Show old price label when simple with discount is selected
                if (!this.options.hideOldPrice) {
                    var $oldPrice = this.options.$tileOrBuybox.find(
                        '.price-box .old-price .price'
                    );

                    $oldPrice.toggle(isProductSelected);
                }
            },
            /**
             * For now swatches on tiles in Magesuite are not clickable.
             * Swatches area on tiles works as a link to PDP.
             * To prevent not indented click on swatches that will lead to PDP we have disallow emulation of swatches select on tile
             * and allo it only on product-info-main area on PDP
             */
            _EmulateSelected: function (selectedAttributes) {
                if (!this.element.closest('.product-info-main').length) {
                    return;
                }

                this._super(selectedAttributes);
            },
            /**
             * When below swatches there is an error after choosing a swatch it does not disapper
             * triggering validation remove error when swatch input has a value
             */
            _OnClick: function ($this, $widget) {
                this._super($this, $widget);

                var $input = $this
                    .parents('.' + $widget.options.classes.attributeClass)
                    .find('.' + $widget.options.classes.attributeInput);

                // If swatch has error validate it to check if remove error if not necessary
                if (
                    !$this.hasClass('disabled') &&
                    $input.hasClass('mage-error')
                ) {
                    $input.valid();
                }
            },
        });

        return $.mage.SwatchRenderer;
    };
});
