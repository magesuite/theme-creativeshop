import * as $ from 'jquery';

import Dailydeal from 'components/dailydeal/dailydeal';
import 'components/daily-deal-teaser/daily-deal-teaser.scss';

const componentClass: string = 'cs-daily-deal-teaser';
const dailyDealTeaserClass: string = 'cs-dailydeal--teaser';

$(`.${dailyDealTeaserClass}`).each(function(): void {
    new Dailydeal($(this), {
        updateLabels: true,
        afterRenderCallback: (dailydeal): void => {
            if (dailydeal && dailydeal._$element.length) {
                dailydeal._$element
                    .parents(`.${componentClass}`)
                    .addClass(`${componentClass}--active`);
            }
        },
        expiredHandler: (dailydeal): void => {
            if (dailydeal && dailydeal._$element.length) {
                dailydeal._$element
                    .parents(`.${componentClass}`)
                    .removeClass(`${componentClass}--active`);
            }
        },
    });
});
