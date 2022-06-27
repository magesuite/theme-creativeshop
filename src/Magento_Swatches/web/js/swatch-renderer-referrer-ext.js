/**
 * Origin: Magento_Swatches/.../swatch-renderer.js
 * Modification type: extend
 * List of modifications:
 * - Add selectSwatchesBasedOnReferrer function
 *
 * This mixin has to be enabled in requirejs-config.js:
 * 'Magento_Swatches/js/swatch-renderer-referrer-ext': true
 */
define(['jquery', 'underscore'], function($, _) {
    'use strict';

    return function(swatchRenderer) {
        $.widget('mage.SwatchRenderer', swatchRenderer, {
            _RenderControls: function() {
                this._super();

                if (!this.inProductList) {
                    this.attachReferrerEvents();
                }
            },
            attachReferrerEvents: function() {
                var gallery = $(this.options.mediaGallerySelector);

                if (gallery.data('gallery')) {
                    this.selectSwatchesBasedOnReferrer();
                    this.handleDisabledAndSingleSwatches();
                } else {
                    gallery.on(
                        'gallery:loaded',
                        function() {
                            this.selectSwatchesBasedOnReferrer();
                            this.handleDisabledAndSingleSwatches();
                        }.bind(this, gallery)
                    );
                }
            },
            selectSwatchesBasedOnReferrer: function() {
                var referrerQueryString = document.referrer.substring(
                    document.referrer.indexOf('?') + 1
                );

                // Do nothing if there is no query string or configred attributes
                if (
                    !(
                        referrerQueryString.length &&
                        $.isArray(this.options.jsonConfig.attributes)
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
                var swatches = this.options.jsonConfig.attributes.reduce(
                    function(acc, swatch) {
                        acc[swatch.code] = acc[swatch.code] || {};

                        $.each(swatch.options, function(index, option) {
                            acc[swatch.code][option.label] = option.id;
                        });

                        return acc;
                    },
                    {}
                );

                $.each(
                    Object.keys(searchParams),
                    function(index, key) {
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

                        this.checkOption(key, optionId);
                    }.bind(this)
                );
            },
            handleDisabledAndSingleSwatches: function() {
                var optionsWithoutDisabledProducts = this.options.jsonConfig.attributes.map(
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

                $.each(
                    optionsWithSingleSwatch,
                    function(index, item) {
                        this.checkOption(item.code, item.options[0].id);
                    }.bind(this)
                );
            },
            checkOption: function(key, optionId) {
                // Select swatches based on attributeCode and optionId
                var $option = this.element.find(
                    '.' +
                        this.options.classes.attributeClass +
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
                        $parentInput.hasClass(this.options.classes.selectClass)
                    ) {
                        $parentInput.val(optionId);
                        $parentInput.trigger('change');
                    } else {
                        $option.trigger('click');
                    }
                }
            },
        });

        return $.mage.SwatchRenderer;
    };
});
