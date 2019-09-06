/**
 * Step Navigator is extended to add scroll to the top of a page every time new step is loaded
 * Before sometimes users did not see important part at the top of a step (f.e. payment methods) and were confused
 */

define(['mage/utils/wrapper', 'jquery'], function(wrapper, $) {
    'use strict';

    return function(StepNavigator) {
        var navigateTo = wrapper.wrap(StepNavigator.navigateTo, function(
            originalAction,
            code,
            scrollToElementId
        ) {
            originalAction(code, scrollToElementId);

            if (!scrollToElementId || !$('#' + scrollToElementId).length) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        });

        StepNavigator.navigateTo = navigateTo;

        return StepNavigator;
    };
});
