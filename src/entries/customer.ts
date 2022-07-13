// =============================================================================
// Customer pages entry point
// It imports all the components required by pages in Customer area.
// Each page type has own entry point containing required components.
// It allows optimizing bundles in webpack - which gathers common imports in separate package.
// It is a job of every component to initilize itself.

import 'config/base.scss';
// TODO: Remove this file when possible
import 'bundle.scss';

// =============================================================================
// Components
// =============================================================================

// Base components
import 'components/authorization-link';
import 'components/addtocart';
import 'components/autocomplete';
import 'components/breadcrumbs';
import 'components/button';
import 'components/container';
import 'components/cookie-message';
import 'components/display-controller';
import 'components/dropdown-switcher';
import 'components/field';
import 'components/footer';
import 'components/grid-layout';
import 'components/headline';
import 'components/header';
import 'components/lazyload';
import 'components/links-block-addto';
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
import 'components/qty-increment';
import 'components/slider';
import 'components/social-media-list';
import 'components/star-rating';
import 'components/swatches';
import 'components/topbar';
import 'components/typography';
import 'components/video-teaser';
import 'components/visually-hidden';
import 'components/select';
import 'components/ie11-modal';
import 'components/pwa-guide';
import 'components/dailydeal';
import 'components/google-recaptcha';

// Carousels (navigation/pagination CSS)
import 'components/_slider';

import 'components/non-critical';

// Customer Area specific
import 'components/calendar';
import 'components/captcha';
import 'components/dashboard';
import 'components/form';
import 'components/password-strength-meter';
import 'components/review';
import 'components/reviews';
import 'components/reviews-summary';
import 'components/stack-nav';
import 'components/sticky-block';
import 'components/table';
import 'components/toolbar';
import 'components/latest-purchased-products';

import 'customizations/plugincompany-contactforms/plugincompany-contactforms';

// Optional components - can be imported in child theme entry
// import 'Amazon_Pay/web/css/source/module.scss';
// import 'components/ie11';
// import 'components/page-scroll';
// import 'components/product-tile-list';
// import 'components/reorder-banner';
// import 'components/tile-gallery';
// import 'components/tooltip';
// import 'components/video-layer';
// import 'MageSuite_InstantPurchase';
// import 'MageSuite_InstantPurchase/user-area';
