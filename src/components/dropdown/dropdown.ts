import { Flyout } from 'components/flyout/flyout';
import * as $ from 'jquery';

$('.cs-dropdown').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-dropdown', type: 'dropdown' });
});
