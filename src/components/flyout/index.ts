import { Flyout } from 'components/flyout/flyout';
import * as $ from 'jquery';

$('.cs-flyout').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-flyout', type: 'flyout' });
});
