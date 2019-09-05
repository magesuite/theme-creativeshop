/**
 * Step Navigator is extended to add scroll to the top of a page every time new step is loaded
 * Before sometimes users did not see important part at the top of a step (f.e. payment methods) and were confused
 */

define(['mage/utils/wrapper', 'jquery'], function(wrapper, $) {
    'use strict';

    return function(StepNavigator) {
        var next = wrapper.wrap(StepNavigator.next, function(originalAction) {
            $('html, body').animate({ scrollTop: 0 }, 300);

            return originalAction();
        });

        var navigateTo = wrapper.wrap(StepNavigator.navigateTo, function(
            originalAction,
            code,
            scrollToElementId
        ) {
            $('html, body').animate({ scrollTop: 0 }, 300);

            return originalAction(code, scrollToElementId);
        });

        StepNavigator.next = next;
        StepNavigator.navigateTo = navigateTo;

        return StepNavigator;
    };
});
