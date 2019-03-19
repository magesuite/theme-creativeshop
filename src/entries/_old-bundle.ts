// =============================================================================
// ** ** entry point
// It imports all the components required by ****
// Each page type has own entry point containing required components.
// It allows optimizing bundles in webpack - which gathers common imports in separate package.
// It is a job of every component to initilize itself.

import 'config/base.scss';
// TODO: Remove this file when possible
import 'bundle.scss';

// =============================================================================
// Components
// =============================================================================
import 'pages/category';
import 'pages/product';
import 'pages/success';
import 'pages/cart';

// Base components
import 'components/authorization-link';
import 'components/addtocart';
import 'components/autocomplete'; //consider moving to ElasticSuite?
import 'components/breadcrumbs';
import 'components/button';
import 'components/container';
import 'components/cookie-message';
import 'components/device-detection';
import 'components/display-controller';
import 'components/dropdown-switcher';
import 'components/field'; // ??
import 'components/footer';
import 'components/grid-layout';
import 'components/headline';
import 'components/header';
import 'components/lazyload';
import 'components/links-block-addto'; // It is part of a navigation, why not there?
import 'components/logo';
import 'components/messages';
import 'components/minicart';
import 'components/minicart-product';
import 'components/modal';
import 'components/navigation';
import 'components/newsletter';
import 'components/offcanvas-toggle';
import 'components/offcanvas-navigation';
import 'components/offcanvas';
import 'components/page-title';
import 'components/page-bottom';
import 'components/price-box';
import 'components/product-tile';
import 'components/slider';
import 'components/social-media-list';
import 'components/star-rating';
import 'components/swatches';
import 'components/tile-gallery';
import 'components/topbar';
import 'components/typography';
import 'components/usps';
import 'components/visually-hidden';
// Content Constructor
import 'components/brand-carousel';
import 'components/category-links';
import 'components/daily-deal-teaser';
import 'components/dailydeal';
import 'components/hero';
import 'components/image-teaser';
import 'components/image-teaser-legacy';
import 'components/paragraph';
import 'components/products-carousel';
import 'components/products-grid';
import 'components/product-finder';
import 'components/separator';
// PDP
import 'components/bundle-box';
import 'components/buybox';
import 'components/indicators';
import 'components/product-gallery';
import 'components/product-details';
// CATEGORY
import 'components/aftersearch-nav';
// CUSTOMER
import 'components/calendar';
import 'components/stack-nav';
import 'components/password-strength-meter';
import 'components/captcha';
import 'components/dashboard';
// CHECKOUT
import 'components/cart';
import 'components/checkout';
import 'components/discount';
import 'components/progress-bar';
// CATEGORY/CUSTOMER
import 'components/toolbar';
// CATEGORY/PDP/CHECKOUT
import 'components/tabs';
// CHECKOUT/PDP
import 'components/qty-increment';
// CHECKOUT/CUSTOMER/PDP
import 'components/form';
import 'components/sticky-block';
import 'components/table';

export { Select } from 'components/select';
export { AddressAutofill } from 'components/address-autofill';

// =============================================================================
// Customizations
// =============================================================================

import 'customizations/reviews/reviews'; // PDP/USER
import 'customizations/plugincompany-contactforms/plugincompany-contactforms';
import 'customizations/video-player/video-player'; // Content Constructor
import 'customizations/searchresults-switcher/searchresults-switcher'; // CATEGORY
