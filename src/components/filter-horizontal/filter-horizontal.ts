/* tslint:disable:no-unused-new object-literal-key-quotes ordered-imports */
import { Flyout } from 'components/flyout/class.flyout';
import * as $ from 'jquery';

$('.cs-filter-horizontal').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-filter-horizontal', type: 'flyout' });
});
