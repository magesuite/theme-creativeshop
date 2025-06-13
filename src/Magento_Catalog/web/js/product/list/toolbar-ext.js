/**
 * Custom method to resolve a11y issues with duplicated toolbar
 */
define(['jquery'], function ($) {
    'use strict';

    return function (originalWidget) {
        $.widget('mage.productListToolbarForm', originalWidget, {
            options: {
                toolbarSelector: 'cs-page-category__toolbar-wrapper',
                sorterLabelClass: '.cs-sorter__label-position',
                amountSelector: '.toolbar-amount',
                instanceType: '',
                translatedSuffixTop: $.mage.__('top'),
                translatedSuffixBottom: $.mage.__('bottom'),
            },

            /** @inheritdoc */
            _create: function () {
                this._super();

                const toolbarSelector = this.options.toolbarSelector;

                if (this.element.closest(`.${toolbarSelector}--top`).length) {
                    this.options.instanceType = 'top';
                } else if (
                    this.element.closest(`.${toolbarSelector}--bottom`).length
                ) {
                    this.options.instanceType = 'bottom';
                }

                this._assignUniqueIds();
            },

            /**
             * Assign unique IDs to sorter elements
             * @private
             */
            _assignUniqueIds: function () {
                if (!this.options.instanceType) {
                    return;
                }

                const elements = [
                    { selector: this.options.orderControl, prefix: 'sorter' },
                    { selector: this.options.limitControl, prefix: 'limiter' },
                    {
                        selector: this.options.amountSelector,
                        prefix: 'toolbar-amount',
                    },
                ];

                elements.forEach(({ selector, prefix }) => {
                    const $element = this.element.find(selector).first();

                    if (!$element.length) {
                        return;
                    }

                    const uniqueId = `${prefix}--${this.options.instanceType}`;

                    $element.attr('id', uniqueId);

                    if (prefix === 'sorter') {
                        const $label = $element.siblings(`label`);
                        if ($label.length) {
                            $label.attr('for', uniqueId);

                            const $labelPosition = $label.find(
                                this.options.sorterLabelClass
                            );
                            if ($labelPosition.length) {
                                $labelPosition.text(
                                    $.mage.__(this.options.instanceType)
                                );
                            }
                        }
                    }

                    if (prefix === 'limiter') {
                        let $limiterAriaLabel = $element.attr('aria-label');

                        $limiterAriaLabel =
                            $limiterAriaLabel +
                            ` (${$.mage.__(this.options.instanceType)})`;
                        $element.attr('aria-label', $limiterAriaLabel);
                    }
                });
            },
        });
    };
});
