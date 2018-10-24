import { Flyout } from 'components/flyout/class.flyout';
import * as $ from 'jquery';

$('.cs-collapse').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-collapse', type: 'collapse' });
});
