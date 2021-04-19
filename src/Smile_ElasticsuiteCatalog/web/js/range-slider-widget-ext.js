/**
 * Default range slider extension which adds support for "from" and "to" inputs
 * synchronized with slider values to provide better UX.
 */

define(['jquery'], function($) {
    'use strict';
    return function(rangeSlider) {
        $.widget('smileEs.rangeSlider', rangeSlider, {
            options: {
                fromInput: '[data-role=from-input]',
                toInput: '[data-role=to-input]',
                toLabel: '[data-role="to-label"]',
                currencyField: '[data-role="currency"]',
                maxLabelOffset: 0,
            },
            _create: function() {
                this._super();

                this._prepareInputs();
                // Extract currency symbol from label and update field.
                this.element
                    .find(this.options.currencyField)
                    .html(this._formatLabel(0).replace(/[\d\s\.\,\-]/g, ''));
            },
            /**
             * Called when range slider changes, used to synchronize inputs' values.
             */
            _refreshDisplay: function() {
                this._super();

                var from = this.element.find(this.options.fromInput).val();
                var to = this.element.find(this.options.toInput).val();

                if (from !== this.from || to !== this.to) {
                    this.element
                        .find(this.options.fromInput)
                        .val(
                            this._formatLabel(this.from).replace(
                                /[^\d\.\,]/g,
                                ''
                            )
                        );
                    this.element
                        .find(this.options.toInput)
                        .val(
                            this._formatLabel(this.to).replace(/[^\d\.\,]/g, '')
                        );
                }
            },
            _prepareInputs: function() {
                this.element
                    .find(this.options.fromInput)
                    .on('keyup blur', this._onInputsChange.bind(this));

                this.element
                    .find(this.options.toInput)
                    .on('keyup blur', this._onInputsChange.bind(this));
            },
            /**
             * Called on blur or enter keyup event to normalize range and update the slider.
             */
            _onInputsChange: function(event) {
                var key = event.key || event.keyCode;

                if (event.type === 'blur' || key === 'Enter' || key === 13) {
                    var from = this.parseStringToFloat(
                        this.element
                            .find(this.options.fromInput)
                            .val()
                            .replace(/[^\d\.\,]/, '') || 0
                    );
                    var to = this.parseStringToFloat(
                        this.element
                            .find(this.options.toInput)
                            .val()
                            .replace(/[^\d\.\,]/, '') || 0
                    );

                    if (!to) {
                        to = this.maxValue;
                    }

                    if (from > to) {
                        from = to - this.rate;
                    }

                    if (from < this.minValue) {
                        from = this.minValue;
                    }

                    if (to > this.maxValue) {
                        to = this.maxValue;
                    }

                    this._updateRange(from, to);
                }
            },
            /**
             * Helper which properly transforms formatted string to float
             * @param {string} amount
             */
            parseStringToFloat: function(amount) {
                return parseFloat(
                    amount
                        .replace(this.options.fieldFormat.groupSymbol, '')
                        .replace(this.options.fieldFormat.decimalSymbol, '.')
                );
            },
            /**
             * Updates slider widget with new values.
             * @param {number} from Lower range value.
             * @param {number} to Upper range value.
             */
            _updateRange: function(from, to) {
                this.from = from;
                this.to = to;

                this.element
                    .find(this.options.sliderBar)
                    .slider('values', [this.from, this.to]);

                this._refreshDisplay();
            },
        });

        return $.smileEs.rangeSlider;
    };
});
