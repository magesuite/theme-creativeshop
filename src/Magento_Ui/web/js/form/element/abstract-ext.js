/**
 * Add additional class _success to field element
 * Success icon visibility for different for can be manipulated by css. By default it is only visible for checkout shipping address form
 */
define(['ko', 'underscore'], function(ko, _) {
    'use strict';

    return function(Abstract) {
        var extendedDefaults = _.extend(Abstract.defaults, { maxlength: '' });

        return Abstract.extend({
            defaults: extendedDefaults,
            initialize: function() {
                this._super();
                this.initializeSuccess();
                return this;
            },
            /**
             * Initialize success observable
             */
            initializeSuccess: function() {
                this.success = ko.observable('');
                this.observe('success');
                this.additionalClasses._success = this.success;
            },
            /**
             * When validate field (it happens when 'value' property is updated) update success observable
             */
            validate: function() {
                var validationResults = this._super();
                if (validationResults.valid && this.value()) {
                    this.success(true);
                } else {
                    this.success(false);
                }

                return validationResults;
            },
        });
    };
});
