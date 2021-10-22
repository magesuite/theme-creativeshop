// =============================================================================
// Checkout entry point
// It imports all the components required by Checkout
// Each page type has own entry point containing required components.
// It allows optimizing bundles in webpack - which gathers common imports in separate package.
// It is a job of every component to initialize itself.

import 'config/base.scss';
// TODO: Remove this file when possible
import 'bundle.scss';

// =============================================================================
// Components
// =============================================================================

// Base components
import 'components/authorization-link';
import 'components/addtocart';
import 'components/autocomplete'; // consider moving to ElasticSuite?
import 'components/breadcrumbs';
import 'components/button';
import 'components/container';
import 'components/cookie-message';
import 'components/display-controller';
import 'components/dropdown-switcher';
import 'components/field';
import 'components/footer';
// import 'components/grid-layout';
import 'components/headline';
import 'components/header';
import 'components/lazyload';
import 'components/links-block-addto'; // It is part of a navigation, why not there?
import 'components/logo';
import 'components/messages';
import 'components/minicart';
import 'components/minicart-product';
import 'components/free-shipping-indicator';
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
import 'components/products-list';
import 'components/push-notification';
import 'components/slider';
import 'components/social-media-list';
import 'components/star-rating';
import 'components/swatches';
import 'components/topbar';
import 'components/typography';
import 'components/visually-hidden';
import 'components/select';
import 'components/toolbar';
import 'components/ie11-modal';
import 'components/pwa-notification';
import 'components/google-recaptcha';

import 'components/non-critical';

// Checkout
import 'pages/success';
import 'pages/cart';

import 'components/calendar';
import 'components/cart';
import 'components/checkout';
import 'components/discount';
import 'components/progress-bar';
import 'components/tabs';
import 'components/qty-increment';
import 'components/form';
import 'components/sticky-block';
import 'components/table';

import 'customizations/plugincompany-contactforms/plugincompany-contactforms';

import 'MageSuite_LoginOrGuestCheckoutStep';

// Optional components - can be imported in child theme entry
// import 'components/tooltip';
// import 'components/tile-gallery';
// import 'components/reorder-banner';
// import 'components/ie11';
// import 'MageSuite_PackstationDhl/web/css/source/module.scss';
