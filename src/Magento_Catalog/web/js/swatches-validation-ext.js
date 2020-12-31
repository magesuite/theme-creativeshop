/**
 * Add offcanvas with missing swatches when user forgot to choose options
 * Immediately after user checks all necessary options add product to the cart
 */
define([
    'jquery',
    'underscore',
    'Magento_Ui/js/modal/modal',
    'mage/validation/validation',
    'jquery-ui-modules/widget',
], function($, _, modal) {
    'use strict';

    return function(productValidate) {
        $.widget('mage.validation', $.mage.validation, {
            listenFormValidateHandler: function(event, validation) {
                this._super(event, validation);

                var $form = $(this);

                if (!$form.is('#product_addtocart_form')) {
                    return;
                }

                if ($('#missing-swatches-modal').length) {
                    return;
                }

                $('body').prepend('<div id="missing-swatches-modal"></div>');

                var $modal = $('#missing-swatches-modal');

                var slideModal = modal(
                    {
                        type: 'slide',
                        responsive: true,
                        clickableOverlay: true,
                        title: $.mage.__('Please select missing options'),
                        modalClass: 'missing-swatches-modal',
                        autoOpen: true,
                        focus: 'none',
                        actions: {
                            cancel: function() {
                                $form.appendTo(
                                    '.cs-buybox__section--product-form'
                                );
                            },
                        },
                        buttons: [],
                    },
                    $modal
                );

                var $formParent = $('.cs-buybox__section--product-form');
                var $clonedForm = $form.clone();
                $formParent.css('height', $formParent.innerHeight());

                $modal.on('modalclosed', function() {
                    $clonedForm.remove();
                    $formParent.prepend($form);
                    $form.find('.product-options-bottom').show();
                    $form.find('input, select').off('change.addToCart');
                    $modal.remove();
                });

                $modal.on('modalopened', function() {
                    $form.find('.product-options-bottom').hide();
                    $form.appendTo('.missing-swatches-modal .modal-content');
                    $formParent.prepend($clonedForm);

                    $form
                        .find('input, select')
                        .on('change.addToCart', function() {
                            if ($form.validation('isValid')) {
                                $form.trigger('processStart');

                                setTimeout(function() {
                                    $clonedForm.remove();
                                    $formParent.prepend($form);
                                    $form
                                        .find('.product-options-bottom')
                                        .show();
                                    $formParent.css('height', '');

                                    slideModal.closeModal();

                                    $form.trigger('processStop');

                                    var jqForm = $form.catalogAddToCart({
                                        bindSubmit: false,
                                    });

                                    jqForm.catalogAddToCart(
                                        'submitForm',
                                        jqForm
                                    );
                                }, 500);
                            }
                        });
                });
            },
        });

        return $.mage.productValidate;
    };
});
