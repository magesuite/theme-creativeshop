/**
 * Step Navigator is extended to add additional scroll to the top of a page from shipping step to payment step. (fix mostly for Safari)
 * Before sometimes users did not see important part at the top of a step (f.e. payment methods) and were confused.
 */

define(['mage/utils/wrapper', 'jquery'], function (wrapper, $) {
    'use strict';

    return function (StepNavigator) {
        var next = wrapper.wrap(
            StepNavigator.next,
            function (originalAction) {
                originalAction();
                $('html').animate({scrollTop:0});
            }
        );

        StepNavigator.next = next;

        return StepNavigator;
    };
});
