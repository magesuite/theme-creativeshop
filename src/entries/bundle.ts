/* tslint:disable:no-unused-expression no-unused-new */

// =============================================================================
// Main scripting entry point.
// We import all of the components here and initialize them.
// It is a job of every component if it is present of the page.
// This approach creates nice bundle, with all of the components and their dependencies.

import 'config/base.scss';

import 'bundle.scss';

// =============================================================================
// Vendors
// =============================================================================

// =============================================================================
// Utilities
// =============================================================================

// =============================================================================
// Pages
// =============================================================================

import 'pages/category';
import 'pages/product';
import 'pages/success';
import 'pages/cart';

// =============================================================================
// Components
// =============================================================================

import 'components/container';
import 'components/navigation';
import 'components/grid-layout';
import 'components/product-tile';
import 'components/offcanvas-toggle';
import 'components/offcanvas-navigation';
import 'components/offcanvas';
import 'components/topbar';
import 'components/logo';
import 'components/authorization-link';
import 'components/header';
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
import 'components/modal';
import 'components/buybox';
import 'components/qty-increment';
import 'components/indicators';
import 'components/bundle-box';
import 'components/product-gallery';
import 'components/slider';
import 'components/aftersearch-nav';
import 'components/tile-gallery';
import 'components/dashboard';
import 'components/swatches';
import 'components/qty-increment';
import 'components/page-title';
import 'components/image-teaser';
import 'components/social-media-list';
import 'components/product-details';
import 'components/device-detection';
import 'components/cookie-message';
import 'components/links-block-addto';
import 'components/price-box';
import 'components/table';
import 'components/sticky-block';
import 'components/visually-hidden';
import 'components/star-rating';
import 'components/dropdown-switcher';
import 'components/display-controller';
import 'components/captcha';
import 'components/lazyload';

export { Select } from 'components/select';
export { default as AddressAutofill } from 'components/address-autofill';

// =============================================================================
// Customizations
// =============================================================================

import 'customizations/pagination/pagination';
import 'customizations/reviews/reviews';
import 'customizations/plugincompany-contactforms/plugincompany-contactforms';
import 'customizations/video-player/video-player';
import 'customizations/searchresults-switcher/searchresults-switcher';
