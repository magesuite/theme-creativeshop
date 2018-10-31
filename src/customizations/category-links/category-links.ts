import * as $ from 'jquery';
import { Flyout } from '../../components/flyout/class.flyout';

$('.cs-category-links-dropdown').each((index: number, element: any) => {
    new Flyout($(element), {
        name: 'cs-category-links-dropdown',
        type: 'flyout',
    });
});
