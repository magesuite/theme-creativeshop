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

import * as $ from 'jquery';

// =============================================================================
// Utilities
// =============================================================================

// =============================================================================
// Pages
// =============================================================================

import 'pages/category';
import 'pages/product';

// =============================================================================
// Components
// =============================================================================

import 'components/navigation';
import 'components/grid-layout';
import 'components/product-tile';
import 'components/collapse/collapse';
import 'components/dropdown/dropdown';
import 'components/filter-horizontal/filter-horizontal';
import 'components/offcanvas-navigation';
import 'components/offcanvas';
import 'components/topbar';
import 'components/logo';
import 'components/authorization-link';
import 'components/header';
import 'components/badge';
import 'components/autocomplete';
import 'components/addtocart';
import 'components/footer';
import 'components/newsletter';
import 'components/hero';
import 'components/headline';
import 'components/category-links';
import 'components/paragraph';
import 'components/page-bottom';
import 'components/separator';
import 'components/usps';
import 'components/cart';
import 'components/discount';
import 'components/minicart';
import 'components/minicart-product';
import 'components/products-carousel';
import 'components/products-grid';
import 'components/brand-carousel';
import 'components/product-finder';
import 'components/dailydeal';
import 'components/daily-deal-teaser';
import 'components/breadcrumbs';
import 'components/progress-bar';
import 'components/calendar';
import 'components/stack-nav';
import 'components/button';
import 'components/field';
import 'components/form';
import 'components/toolbar';
import 'components/password-strength-meter';
import 'components/messages';
import 'components/checkout';
import 'components/tabs';
import 'components/buybox';
import 'components/qty-increment';
import 'components/indicators';
import 'components/bundle-box';
import 'components/product-gallery';
import 'components/slider';
import 'components/aftersearch-nav';
import 'components/tile-gallery';

export { Flyout } from 'components/flyout/flyout';
export { Select } from 'components/select';
export { default as AddressAutofill } from 'components/address-autofill';

// =============================================================================
// Customizations
// =============================================================================

import { init as collapsibleText } from 'components/collapsible-text/collapsible-text';
collapsibleText();

import { QtyIncrementCollection } from 'customizations/qty-increment/qty-increment';
new QtyIncrementCollection();

import 'customizations/image-teaser/image-teaser';
import 'customizations/sticky-block/sticky-block';
import 'customizations/pagination/pagination';
import 'customizations/reviews/reviews';
import 'customizations/item-cloner/item-cloner';
import 'customizations/plugincompany-contactforms/plugincompany-contactforms';
import 'customizations/video-player/video-player';
import 'customizations/searchresults-switcher/searchresults-switcher';

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
