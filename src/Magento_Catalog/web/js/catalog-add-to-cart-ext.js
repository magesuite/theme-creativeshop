/**
 * Origin: Native M2 CatalogAddToCart widget
 * Modification type: override
 * Reason: due to PDP changes regarding adding product to the cart this plugin is wrapper with PDP validator which hardcodes options we need to use in order to properly animate/process AJAX add-to-cart action and receive/provide feedback directly on the button. This is why we decided to set default options to the ones we need instead of overriding product validator widget and possibly some other in the future.
 */
define([
    'jquery',
], function ($) {
    'use strict';

    return function(mageCatalogAddToCart) {
        $.widget('mage.catalogAddToCart', mageCatalogAddToCart, {
            options: {
                processStart: 'ajax:AddToCartProcessing',
                processStop: 'ajax:AddToCartDone',
                bindSubmit: true,
                minicartSelector: '[data-block="minicart"]',
                messagesSelector: '.cs-messages',
                productStatusSelector: '.stock.available',
                addToCartButtonSelector: '.tocart',
                addToCartButtonDisabledClass: 'disabled cs-addtocart__button--disabled atc-ajax-processing',
                addToCartButtonTextWhileAdding: '',
                addToCartButtonTextAdded: '',
                addToCartButtonTextDefault: ''
            }
        });

        return $.mage.catalogAddToCart;
    };
});
