define([
    'ko'
], function (ko) {
    'use strict';

    var mixin = {
        // T&C checkboxes with the same ID are linked by "checked" binding.
        // Clicking on visible one, selects also hidden one.
        // NOTE: Checkout has duplicated T&C blocks which are displayed
        // according to current view (desktop, mobile).
        checkboxState: ko.observableArray(false),
    };

   return function (target) {
       return target.extend(mixin);
   };
});
