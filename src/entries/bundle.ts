/* tslint:disable:no-unused-expression no-unused-new */

// =============================================================================
// Main scripting entry point.
// We import all of the components here and initialize them.
// It is a job of every component if it is present of the page.
// This approach creates nice bundle, with all of the components and their dependencies.

import 'bundle.scss';

// =============================================================================
// Vendors
// =============================================================================

import 'vendors';
import $ from 'jquery';

// =============================================================================
// Utilities
// =============================================================================

// =============================================================================
// Components
// =============================================================================

import 'components/collapse/collapse';
import 'components/dropdown/dropdown';
import 'components/filter-horizontal/filter-horizontal';

import { Flyout } from 'components/flyout/class.flyout';
export { Flyout };

// =============================================================================
// Customizations
// =============================================================================

import 'customizations/header-search/header-search';
import Select from 'customizations/select/select';
export { Select };
import { init as collapsibleText } from 'components/collapsible-text/collapsible-text';
collapsibleText();
import 'customizations/navigation/navigation';
import 'customizations/offcanvas-navigation/offcanvas-navigation';
import 'customizations/offcanvas/offcanvas';
import { QtyIncrementCollection } from 'customizations/qty-increment/qty-increment';
new QtyIncrementCollection();
import 'customizations/aftersearch-nav/aftersearch-nav';
import 'customizations/hero/hero';
import 'customizations/image-teaser/image-teaser';
import 'customizations/products-promo/products-promo';
import 'customizations/brand-carousel/brand-carousel';
import 'customizations/category-links/category-links';
import 'customizations/sticky-block/sticky-block';
import 'customizations/pagination/pagination';
import 'customizations/reviews/reviews';
import 'customizations/item-cloner/item-cloner';
import 'customizations/grid-layout/grid-layout';
import 'customizations/product-finder/product-finder';
import 'customizations/indicators/fast-shipping-init';
import 'customizations/dailydeal/dailydeal';
import 'customizations/plugincompany-contactforms/plugincompany-contactforms';
import 'customizations/cart/cart';
import 'customizations/video-player/video-player';
import 'customizations/searchresults-switcher/searchresults-switcher';
import AddressAutofill from 'customizations/address-autofill/address-autofill';
export { AddressAutofill };

// Sometimes there is a need to apply different styling for mobile/tablet devices and body class is necessary
if (isMobile.any) {
    document.body.classList.add('is-mobile');
}

if (isMobile.tablet) {
    document.body.classList.add('is-tablet');
} else if (isMobile.phone) {
    document.body.classList.add('is-phone');
}

window.addEventListener(
    'touchstart',
    function onFirstTouch(): void {
        document.body.classList.add('touch-device');
        window.removeEventListener('touchstart', onFirstTouch, false);
    },
    false
);
