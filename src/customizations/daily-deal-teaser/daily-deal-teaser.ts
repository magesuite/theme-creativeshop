/* tslint:disable:no-unused-new */

import $ from 'jquery';

import Dailydeal from '../../../node_modules/creative-patterns/packages/components/dailydeal/src/dailydeal';

const namespace: string = 'cs-';

/**
 * Dailydeal teaser component initialization
 */

// DD teaser component
const teaserClass: string = `${namespace}daily-deal-teaser`;

$(`.${namespace}dailydeal--teaser`).each(function(): void {
    new Dailydeal($(this), {
        namespace: namespace,
        updateLabels: true,
        afterRenderCallback: (dailydeal): void => {
            if (dailydeal && dailydeal._$element.length) {
                dailydeal._$element
                    .parents(`.${teaserClass}`)
                    .addClass(`${teaserClass}--active`);
            }
        },
        expiredHandler: (dailydeal): void => {
            if (dailydeal && dailydeal._$element.length) {
                dailydeal._$element
                    .parents(`.${teaserClass}`)
                    .removeClass(`${teaserClass}--active`);
            }
        },
    });
});
