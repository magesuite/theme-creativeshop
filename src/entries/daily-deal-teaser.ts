import * as $ from 'jquery';
import { Dailydeal } from 'components/daily-deal-teaser';

export function ccDailyDealTeaser(config, element) {
    const settings: any = $.extend({}, config, {
        updateLabels: true,
        expiredHandler: (dailydeal): void => {
            if (dailydeal && dailydeal._$element.length) {
                dailydeal._$element
                    .parents('.cs-daily-deal-teaser')
                    .removeClass('cs-daily-deal-teaser--active');
            }
        },
    });

    new Dailydeal($(element), settings);
}
