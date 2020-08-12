import * as $ from 'jquery';
import { Dailydeal } from 'components/daily-deal-teaser';

export function mgsDailyDeal(config, element) {
    new Dailydeal($(element), config);
}
