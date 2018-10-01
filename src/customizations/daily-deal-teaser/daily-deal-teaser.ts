/* tslint:disable:no-unused-new */

import $ from 'jquery';

import Dailydeal from '../../../node_modules/creative-patterns/packages/components/dailydeal/src/dailydeal';

const namespace: string = 'cs-';

/**
 * Dailydeal teaser component initialization
 */

// DD teaser component
const teaserSelector: string = `.${namespace}daily-deal-teaser`;

new Dailydeal($(`.${namespace}dailydeal--teaser`), {
    namespace: namespace,
    updateLabels: true,
    afterRenderCallback: (dd): void => {
        if (dd && dd._$element.length) {
            dd._$element
                .parents(teaserSelector)
                .addClass(`${namespace}daily-deal-teaser--active`);
        }
    },
    expiredHandler: (dd): void => {
        if (dd && dd._$element.length) {
            dd._$element
                .parents(teaserSelector)
                .removeClass(`${namespace}daily-deal-teaser--active`);
        }
    },
});
