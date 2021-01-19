define([
    'jquery',
    'ko',
    'Magento_CheckoutAgreements/js/model/agreements-modal',
], function($, ko, agreementsModal) {
    'use strict';

    var mixin = {
        // T&C checkboxes with the same ID are linked by "checked" binding.
        // Clicking on visible one, selects also hidden one.
        // NOTE: Checkout has duplicated T&C blocks which are displayed
        // according to current view (desktop, mobile).
        checkboxState: ko.observableArray(false),

        // Allows using "merged" T&Cs - documentation and examples on confluence
        showContent: function(element, event) {
            this.modalTitle(element.checkboxText);
            this.modalContent(
                '<div class="agreements-modal-content">' +
                    element.content +
                    '</div>'
            );
            this.contentHeight(
                element.contentHeight ? element.contentHeight : 'auto'
            );

            var $modalContent = $('.agreements-modal-content');
            var $target = $modalContent.find($(event.target).attr('href'));

            if ($target.length) {
                $modalContent.children().hide();
                $target.show();
            } else if (
                !$target.length &&
                !$(event.target).is('a') &&
                element.checkboxText.indexOf(' href=') !== -1
            ) {
                var $parentLabel = $(event.target).parents('label');
                if ($parentLabel.length) {
                    $('#' + $parentLabel.attr('for')).trigger('click');
                }
                return;
            } else {
                $modalContent.children().show();
            }

            agreementsModal.showModal();
        },
    };

    return function(target) {
        return target.extend(mixin);
    };
});
