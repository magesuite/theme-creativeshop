/**
 * Origin: Native M2 Collapsible Widget
 * Modification type: extend
 * Reason: introducing collapse functionality only for given media query, activate/deactivate for mobile or desktop depending on configuration given
 */
define([
    'jquery',
    'matchMedia'
], function ($, mediaCheck) {
    'use strict';

    return function(mageCollapsible) {
        $.widget('mage.collapsible', mageCollapsible, {
            options: {
                mediaQueryScope: '',
                isCreated: false,
                initialActiveOption: undefined
            },

            _create: function(isMediaCheckActive) {
                /**
                 * Save original `active` option to another one as original widget operates on the original option. We want to recreate collapse with original settings passed to options
                 */
                this.options.initialActiveOption = this.options.active;

                // we only want to run _scopeToMediaQuery once if needed at all
                if (typeof isMediaCheckActive === 'undefined') {
                    isMediaCheckActive = false;
                }

                if (!this.options.mediaQueryScope.length || isMediaCheckActive) {
                    this._super();
                    this.options.isCreated = true;
                } else {
                    this._scopeToMediaQuery();
                }
            },

            /**
             * Custom method (not overriden one)
             * Activates/Deactivates collapse functionality based on given Media Query defined in options
             */
            _scopeToMediaQuery: function() {
                var mediaQueryScope = this.options.mediaQueryScope;

                mediaCheck({
                    media: mediaQueryScope,
                    entry: $.proxy(function () {
                        if (!this.options.isCreated) {
                            this._recreate();
                        }
                    }, this),
                    exit: $.proxy(function () {
                        if (this.options.isCreated) {
                            this._initDestroySequence();
                        }
                    }, this)
                });
            },

            /**
             * Custom method (not overriden one)
             * Re-creates collapse functionality
             */
            _recreate: function() {
                this.options.active = this.options.initialActiveOption;
                this._create(true);
            },

            /**
             * Custom method (not overriden one)
             * Removes collapse functionality along with events and informs plugin it was destroyed
             */
            _initDestroySequence: function() {
                this.activate();
                this._destroy();
                this._off(this.trigger);
                this.options.isCreated = false;
            }
        });

        return $.mage.collapsible;
    };
});
