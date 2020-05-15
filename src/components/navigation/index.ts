import * as $ from 'jquery';

import 'components/navigation/teaser';

import Navigation from 'components/navigation/navigation';
import NavigationMegaDropdown from 'components/navigation/navigation-mega-dropdown';

import 'components/navigation/navigation.scss';

const $navigation: JQuery = $('.cs-navigation');
let NavigationClass = Navigation;
/**
 * Navigation component initialization
 */
if ($navigation.find('[data-category-identifier="all-categories"]').length) {
    NavigationClass = NavigationMegaDropdown;
}

setTimeout(() => {
    new NavigationClass($navigation, {});
});
