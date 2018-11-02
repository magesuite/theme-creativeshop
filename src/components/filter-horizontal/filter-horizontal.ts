import { Flyout } from 'components/flyout/flyout';
import * as $ from 'jquery';

$('.cs-filter-horizontal').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-filter-horizontal', type: 'flyout' });
});
