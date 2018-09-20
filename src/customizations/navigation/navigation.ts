/* tslint:disable:no-unused-new */

import * as $ from 'jquery';

import Navigation from 'components/navigation/navigation';

const namespace: string = 'cs-';
/**
 * Navigation component initialization
 */
new Navigation($(`.${namespace}navigation`), {
    containerClassName: `${namespace}navigation__list`,
    itemClassName: `${namespace}navigation__item`,
    flyoutClassName: `${namespace}navigation__flyout`,
    flyoutVisibleClassName: `${namespace}navigation__flyout--visible`,
    flyoutColumnsClassName: `${namespace}navigation__categories`,
    flyoutDefaultColumnCount: 5,
    showNavigationOverlay: false,
    highlightActiveCategory: true,
    highlightWholeTree: true,
    activeCategoryClassName: 'active',
});
