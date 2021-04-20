/**
 * Extends time after messages are hidden from 5s to 30s.
 */
define(['ko', 'jquery'], function(ko, $) {
    'use strict';
    return function(Messages) {
        return Messages.extend({
            /**
             * @param {Boolean} isHidden
             */
            onHiddenChange: function(isHidden) {
                var self = this;

                // Hide message block if needed
                if (isHidden) {
                    setTimeout(function() {
                        $(self.selector).hide('blind', {}, 500);
                    }, 30000);
                }
            },
        });
    };
});
