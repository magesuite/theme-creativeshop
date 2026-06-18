define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'Magento_Customer/js/customer-data',
    'mage/cookies',
], function ($, modal, customerData) {
    'use strict';

    /**
     * Full-replace mixin for Magento_OrderCancellationUi/js/cancel-order-modal.
     *
     * Root cause (KRG-3410): theme-creativeshop ships a messages-ext.js mixin that hooks beforeunload
     * and purges the customer-data messages section right before navigation. The upstream
     * setTimeout() + customerData.set() pattern races with both that purge and the page
     * reload itself, so the message never reaches the new page.
     *
     * Fix:
     *   - Success path: write to the "mage-messages" cookie (survives the purge, read by messages.js on the next page).
     *   - Error path: customerData.set into the messages section observable (no reload).
     *   - global: false on the AJAX stops customer-data's section re-fetch from wiping the error message ~150ms later.
     *
     * Also includes the existing fix for translatable modal title (FZ-741).
     * Full issue description: JIRA ticket KRG-3410.
     */
    return function (target) {
        return function (config, element) {
            let order_id = config.order_id,
                options = {
                    type: 'popup',
                    responsive: true,
                    title: $.mage.__('Cancel Order'), // FZ-741: make modal title translatable
                    buttons: [
                        {
                            text: $.mage.__('Close'),
                            class: 'action-secondary action-dismiss close-modal-button',

                            /** @inheritdoc */
                            click: function () {
                                this.closeModal();
                            },
                        },
                        {
                            text: $.mage.__('Confirm'),
                            class: 'action-primary action-accept cancel-order-button',

                            /** @inheritdoc */
                            click: function () {
                                let thisModal = this,
                                    reason = $('#cancel-order-reason-' + order_id)
                                        .find(':selected')
                                        .text(),
                                    mutation = `
mutation cancelOrder($order_id: ID!, $reason: String!) {
  cancelOrder(input: {order_id: $order_id, reason: $reason}) {
    error
    order {
      status
    }
  }
}`;

                                $.ajax({
                                    global: false,
                                    type: 'POST',
                                    url: `${config.url}graphql`,
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        query: mutation,
                                        variables: {
                                            order_id: btoa(config.order_id),
                                            reason: reason,
                                        },
                                    }),
                                    beforeSend: function () {
                                        $('[data-container="body"]')
                                            .addClass('ajax-loading')
                                            .attr('aria-busy', true)
                                            .trigger('processStart');
                                    },
                                    complete: function (response) {
                                        $('[data-container="body"]')
                                            .removeClass('ajax-loading')
                                            .attr('aria-busy', false)
                                            .trigger('processStop');

                                        if (response.responseJSON.data.cancelOrder.error !== null) {
                                            customerData.set('messages', {
                                                messages: [
                                                    {
                                                        text: $.mage.__(
                                                            response.responseJSON.data.cancelOrder
                                                                .error
                                                        ),
                                                        type: 'error',
                                                    },
                                                ],
                                                data_id: Math.floor(Date.now() / 1000),
                                            });
                                        } else {
                                            $.mage.cookies.set(
                                                'mage-messages',
                                                JSON.stringify([
                                                    {
                                                        text: $.mage.__(
                                                            response.responseJSON.data.cancelOrder
                                                                .order.status
                                                        ),
                                                        type: 'success',
                                                    },
                                                ]),
                                                {
                                                    samesite: 'strict',
                                                    domain: '',
                                                }
                                            );
                                            location.reload();
                                        }
                                    },
                                }).always(function () {
                                    thisModal.closeModal(true);
                                });
                            },
                        },
                    ],
                };

            $(element).on('click', function () {
                $('#cancel-order-modal-' + order_id).modal('openModal');
            });

            modal(options, $('#cancel-order-modal-' + order_id));
        };
    };
});
