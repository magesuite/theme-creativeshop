import * as $ from 'jquery';
import { Flyout } from '../flyout/class.flyout';

$('.cs-category-links-dropdown').each((index: number, element: any) => {
    new Flyout($(element), {
        name: 'cs-category-links-dropdown',
        type: 'flyout',
    });
});
