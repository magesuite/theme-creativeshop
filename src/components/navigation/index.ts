import * as $ from 'jquery';

import 'components/navigation/teaser';

import Navigation from 'components/navigation/navigation';
import NavigationMegaDropdown from 'components/navigation/navigation-mega-dropdown';

import 'components/navigation/navigation.scss';

const $navigation: JQuery = $('.cs-navigation');

/**
 * Navigation component initialization
 */
if ($navigation.find('[data-category-identifier="all-categories"]').length) {
    new NavigationMegaDropdown($navigation, {});
} else {
    new Navigation($navigation, {});
}
