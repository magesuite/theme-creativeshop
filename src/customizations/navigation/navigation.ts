/* tslint:disable:no-unused-new */

import $ from 'jquery';

import Navigation from '../../../node_modules/creative-patterns/packages/components/navigation/src/navigation';

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
