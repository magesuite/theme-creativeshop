/**
 * Origin: Magento swatch renderer
 * Modification type: extend
 * Reason:
 * To add selecting swatches based on selected filters (by referrer url).
 * Swatches can be selected only after:
 * - gallery is loaded, to keep correct gallery behaviour
 * - attributes config is prepared by widget logic
 */
define(['jquery', 'underscore', 'mage/translate'], function($, _, $t) {
    'use strict';

    return function(swatchRenderer) {
        $.widget('mage.SwatchRenderer', swatchRenderer, {
            options: {
                selectorProductTile: '.cs-product-tile',
            },
            _onGalleryLoaded: function(gallery) {
                this._super(gallery);

                // Add gallery loaded flag for selecting swatches reference
                this._isGalleryLoaded = true;
            },
            _determineProductData: function() {
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
            updateBaseImage: function(images, context, isInProductView) {
                var justAnImage = images[0];

                if (isInProductView) {
                    return this._super(images, context, isInProductView);
                }

                if (justAnImage && justAnImage.img) {
                    // Fixed element extraction for our markup.
                    this.element
                        .parents(this.options.selectorProductTile)
                        .find('.cs-product-tile__image')
                        .attr('src', justAnImage.img)
                        .attr('srcset', justAnImage.img);
                }
            },
            _RenderControls: function() {
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

                    $.each(_this.options.jsonConfig.attributes, function(
                        index,
                        item
                    ) {
                        if (item.options.length === 1) {
                            _this._checkOption(item.code, item.options[0].id);
                        }
                    });
                }

                $(gallery).on('gallery:loaded', function() {
                    _this._SelectSwatchesBasedOnReferrer();

                    var optionsWithoutDisabledProducts = _this.options.jsonConfig.attributes.map(
                        function(currentValue, index, array) {
                            currentValue.options = currentValue.options.filter(
                                function(element, index, array) {
                                    return element.products.length > 0;
                                }
                            );

                            return currentValue;
                        }
                    );

                    var optionsWithSingleSwatch = optionsWithoutDisabledProducts.filter(
                        function(element, index, array) {
                            return element.options.length === 1;
                        }
                    );

                    $.each(optionsWithSingleSwatch, function(index, item) {
                        _this._checkOption(item.code, item.options[0].id);
                    });
                });
            },
            _SelectSwatchesBasedOnReferrer: function() {
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

                $.each(referrerQueryString.split('&'), function(index, item) {
                    var split = item.split('=');
                    var key = split[0] && decodeURIComponent(split[0]);
                    var value = split[1] && decodeURIComponent(split[1]);

                    (searchParams[key] = searchParams[key] || []).push(value);
                });

                // Reduce swatches config to have just option labels and IDs
                var swatches = _this.options.jsonConfig.attributes.reduce(
                    function(acc, swatch) {
                        acc[swatch.code] = acc[swatch.code] || {};

                        $.each(swatch.options, function(index, option) {
                            acc[swatch.code][option.label] = option.id;
                        });

                        return acc;
                    },
                    {}
                );

                $.each(Object.keys(searchParams), function(index, key) {
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
            _checkOption: function(key, optionId) {
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
            _RenderFormInput: function(config) {
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
            _UpdatePrice: function() {
                this._super();
                var options = _.object(_.keys(this.optionsMap), {});

                this.element
                    .find(
                        '.' +
                            this.options.classes.attributeClass +
                            '[option-selected]'
                    )
                    .each(function() {
                        var attributeId = $(this).attr('attribute-id');

                        options[attributeId] = $(this).attr('option-selected');
                    });

                var result = this.options.jsonConfig.optionPrices[
                    _.findKey(this.options.jsonConfig.index, options)
                ];

                var $discounted =
                    typeof result !== 'undefined' &&
                    result.oldPrice.amount !== result.finalPrice.amount;

                $(
                    '.normal-price .price-final_price .price-wrapper .price'
                ).toggleClass('discounted-price', $discounted);
            },
            /**
             * For now swatches on tiles in Magesuite are not clickable.
             * Swatches area on tiles works as a link to PDP.
             * To prevent not indented click on swatches that will lead to PDP we have disallow emulation of swatches select on tile
             * and allo it only on product-info-main area on PDP
             */
            _EmulateSelected: function(selectedAttributes) {
                if (!this.element.closest('.product-info-main').length) {
                    return;
                }

                this._super(selectedAttributes);
            },
            /**
             * When below swatches there is an error after choosing a swatch it does not disapper
             * triggering validation remove error when swatch input has a value
             */
            _OnClick: function($this, $widget) {
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
