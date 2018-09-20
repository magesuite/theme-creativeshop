/* tslint:disable:no-unused-new object-literal-key-quotes */
import { Flyout } from 'components/flyout/class.flyout';
import $ from 'jquery';

$('.cs-flyout').each((index: number, element: any) => {
    new Flyout($(element), { name: 'cs-flyout', type: 'flyout' });
});
