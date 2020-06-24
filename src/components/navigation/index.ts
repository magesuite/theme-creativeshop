import * as $ from 'jquery';

import 'components/navigation/teaser';

import Navigation from 'components/navigation/navigation';
import NavigationMegaDropdown from 'components/navigation/navigation-mega-dropdown';

import 'components/navigation/navigation.scss';

const navigationElement = document.querySelector(
    '.cs-navigation'
) as HTMLElement;

if (navigationElement) {
    let NavigationClass = Navigation;
    /**
     * Navigation component initialization
     */
    if (
        navigationElement.querySelector(
            '[data-category-identifier="all-categories"]'
        )
    ) {
        NavigationClass = NavigationMegaDropdown;
    }

    setTimeout(() => {
        new NavigationClass($(navigationElement), {});
    });
}
