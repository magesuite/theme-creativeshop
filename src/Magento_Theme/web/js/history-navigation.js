define(['jquery'], function($) {
    'use strict';

    $.widget('magesuite.historyNavigation', {
        _create: function() {
            this._super();

            var actionsMapping = {
                goBack: this.goBack,
            };
            var options = this.options;

            $(this.element).on('click', function() {
                actionsMapping[options.action]();
            });
        },
        goBack: function() {
            window.history.back();
        },
    });

    return $.magesuite.historyNavigation;
});
