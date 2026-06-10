/**
 * Changes in comparison to source file:
 * - modified: createModal to add title (l:24),
 * Aligned with Magento 2.4.9 in 05/2026
 */
define(['jquery', 'Magento_Ui/js/modal/modal', 'mage/translate'], function (
    $,
    modal,
    $t
) {
    'use strict';

    return function (agreementsModal) {
        agreementsModal.createModal = function (element) {
            var options;

            this.modalWindow = element;
            options = {
                type: 'popup',
                modalClass: 'agreements-modal',
                responsive: true,
                innerScroll: true,
                trigger: '.show-modal',
                title: $t('Terms and Conditions'),
                buttons: [
                    {
                        text: $t('Close'),
                        class: 'action secondary action-hide-popup',

                        /** @inheritdoc */
                        click: function () {
                            this.closeModal();
                        },
                    },
                ],
            };
            modal(options, $(this.modalWindow));
        };

        return agreementsModal;
    };
});
