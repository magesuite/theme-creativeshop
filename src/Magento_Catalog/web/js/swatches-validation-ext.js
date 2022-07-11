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

                // Skip for other than addtocart form
                if ($form.prop('id') !== 'product_addtocart_form') {
                    return;
                }

                // Skip for Bundle products
                if (document.body.classList.contains('page-product-bundle')) {
                    return;
                }

                /**
                 * Returns modal jQuery object
                 *
                 * @return $('#missing-swatches-modal')
                 */
                function getModal() {
                    return $('#missing-swatches-modal');
                }

                /**
                 * Open modal if already exists
                 * Check if already opened
                 */
                if (getModal().length > 0) {
                    if (!document.body.classList.contains('_has-modal')) {
                        getModal().modal('openModal');
                    }
                    return;
                }

                // Create modal
                $(document.body).prepend(
                    '<div id="missing-swatches-modal"></div>'
                );

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
                    getModal()
                );

                var $formParent = $('.cs-buybox__section--product-form');
                var $clonedForm = $form.clone();
                $formParent.css('height', $formParent.innerHeight());

                // Attach events
                getModal().on('modalclosed', function() {
                    $clonedForm.remove();
                    $formParent.prepend($form);
                    $form.find('.product-options-bottom').show();
                    $form.find('input, select').off('change.addToCart');
                    $formParent.css('height', '');
                });

                getModal().on('modalopened', function() {
                    $form.find('.product-options-bottom').hide();
                    $form.appendTo('.missing-swatches-modal .modal-content');
                    $formParent.prepend($clonedForm);

                    $form
                        .find('input, select')
                        .on('change.addToCart', function() {
                            if ($form.validation('isValid')) {
                                $form.trigger('processStart');

                                $clonedForm.remove();
                                $formParent.prepend($form);
                                $form.find('.product-options-bottom').show();
                                $formParent.css('height', '');

                                slideModal.closeModal();

                                $form.trigger('processStop');

                                var jqForm = $form.catalogAddToCart({
                                    bindSubmit: false,
                                });

                                jqForm.catalogAddToCart('submitForm', jqForm);
                            }
                        });
                });
            },
        });

        return $.mage.productValidate;
    };
});
