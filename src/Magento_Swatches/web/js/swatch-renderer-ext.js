/**
 * Origin: Magento swatch renderer
 * Modification type: extend
 * Reason:
 * To add selecting swatches based on selected filters (by referrer url).
 * Swatches can be selected only after:
 * - gallery is loaded, to keep correct gallery behaviour
 * - attributes config is prepared by widget logic
 */
define(['jquery'], function($) {
    'use strict';

    return function(swatchRenderer) {
        $.widget('mage.SwatchRenderer', swatchRenderer, {
            _onGalleryLoaded: function(gallery) {
                this._super(gallery);

                // Add gallery loaded flag for selecting swatches reference
                this._isGalleryLoaded = true;
            },
            _RenderControls: function() {
                this._super();
                var _this = this;
                var gallery = $(
                    '[data-gallery-role=gallery-placeholder]',
                    '.column.main'
                );

                // If gallery is already loaded, select swatches
                // otherwise wait for 'gallery:loaded' event
                if (_this._isGalleryLoaded === true) {
                    _this._SelectSwatchesBasedOnReferrer();
                }

                $(gallery).on('gallery:loaded', function() {
                    _this._SelectSwatchesBasedOnReferrer();
                });
            },
            _SelectSwatchesBasedOnReferrer: function() {
                var _this = this;

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
                            $parentInput.hasClass(
                                _this.options.classes.selectClass
                            )
                        ) {
                            $parentInput.val(optionId);
                            $parentInput.trigger('change');
                        } else {
                            $option.trigger('click');
                        }
                    }
                });
            },
        });

        return $.mage.SwatchRenderer;
    };
});
