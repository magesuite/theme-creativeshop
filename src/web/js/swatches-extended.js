define([
    'jquery',
    'jquery/ui',
    'Magento_Swatches/js/swatch-renderer'
], function($){

    $.widget('creativeshop.SwatchRenderer', $.mage.SwatchRenderer, {
        _UpdatePrice: function () {
            var $widget = this,
                $product = $widget.element.parents($widget.options.selectorProduct),
                $productPrice = $product.find(this.options.selectorProductPrice),
                options = _.object(_.keys($widget.optionsMap), {}),
                result;

            $widget.element.find('.' + $widget.options.classes.attributeClass + '[option-selected]').each(function () {
                var attributeId = $(this).attr('attribute-id');

                options[attributeId] = $(this).attr('option-selected');
            });

            result = $widget.options.jsonConfig.optionPrices[_.findKey($widget.options.jsonConfig.index, options)];

            $productPrice.trigger(
                'updatePrice',
                {
                    'prices': $widget._getPrices(result, $productPrice.priceBox('option').prices)
                }
            );

            if ( result && ( result.oldPrice.amount !== result.finalPrice.amount ) ) {
                $(this.options.slyOldPriceSelector).show();
                $( '.special-price' ).addClass( 'active' );
            } else {
                $(this.options.slyOldPriceSelector).hide();
                $( '.special-price' ).removeClass( 'active' );
            }
        },

    });

    return $.creativeshop.SwatchRenderer;
});