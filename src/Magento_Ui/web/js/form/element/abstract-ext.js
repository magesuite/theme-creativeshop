/**
 * Add additional class _success to field element
 * Success icon visibility for different for can be manipulated by css. By default it is only visible for checkout shipping address form
 * Add editing state class. Functionality can be disabled by setting enableEditingState option to false
 */
define(['ko', 'underscore'], function (ko, _) {
    'use strict';

    return function (Abstract) {
        return Abstract.extend({
            defaults: {
                maxlength: '',
                enableEditingState: true,
            },
            initialize: function () {
                this._super();
                this.initializeSuccess();
                this.initializeEditingState();
                return this;
            },
            /**
             * Initialize success observable
             */
            initializeSuccess: function () {
                this.success = ko.observable('');
                this.observe('success');
                this.additionalClasses._success = this.success;
            },
            /**
             * Initialize under editing state
             */
            initializeEditingState: function () {
                if (!this.enableEditingState) {
                    return;
                }

                const self = this;

                this.editing = ko.observable('');
                this.observe('editing');
                this.additionalClasses._editing = this.editing;

                if (this.getInitialValue()) {
                    self.editing(false);
                }

                this.on('value', () => {
                    if (self.editing() === '') {
                        self.editing(true);
                    }
                });

                this.on(
                    'value',
                    _.debounce(function () {
                        self.editing(false);
                    }, 500)
                );
            },
            /**
             * When validate field (it happens when 'value' property is updated) update success observable
             */
            validate: function () {
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
