/**
 * Mixin: updates document.title when checkout step changes.
 */

define(['mage/utils/wrapper'], function (wrapper) {
    'use strict';

    function buildCheckoutPageTitle(stepTitle) {
        const prefix = window.checkoutConfig?.checkoutPageTitle?.prefix || '';
        const suffix = window.checkoutConfig?.checkoutPageTitle?.suffix || '';
        return [prefix, stepTitle].filter(Boolean).join(' - ').trim() + suffix;
    }

    function updateDocumentTitle(stepNavigator, code) {
        const step = stepNavigator
            .steps()
            .find(
                ({ code: stepCode, alias }) =>
                    stepCode === code || alias === code
            );

        const title =
            step?.title &&
            (typeof step.title === 'function' ? step.title() : step.title);
        if (title) {
            document.title = buildCheckoutPageTitle(title);
        }
    }

    function updateDocumentTitleFromVisibleStep(stepNavigator) {
        const visibleStep = stepNavigator
            .steps()
            .find((step) => step.isVisible?.());
        const title =
            visibleStep?.title &&
            (typeof visibleStep.title === 'function'
                ? visibleStep.title()
                : visibleStep.title);

        if (title) {
            document.title = buildCheckoutPageTitle(title);
        }
    }

    return function (StepNavigator) {
        StepNavigator.next = wrapper.wrap(
            StepNavigator.next,
            function (originalAction) {
                originalAction();
                updateDocumentTitleFromVisibleStep(StepNavigator);
            }
        );

        StepNavigator.handleHash = wrapper.wrap(
            StepNavigator.handleHash,
            function (originalAction) {
                const result = originalAction();
                if (!result) {
                    updateDocumentTitleFromVisibleStep(StepNavigator);
                }
                return result;
            }
        );

        setTimeout(function () {
            updateDocumentTitleFromVisibleStep(StepNavigator);
        }, 0);

        return StepNavigator;
    };
});
