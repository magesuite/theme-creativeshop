/**
 * Category Page entry point.
 * It imports all the components required by Category Page.
 * Each page type has own entry point containing required components.
 * It allows optimizing bundles in webpack - which gathers common imports in separate package.
 * It is a job of every component to initilize itself.
 */

import 'config/base.scss';

/**
 * Base components
 */
import 'Magento_Theme';
import 'components/_slider';
import 'components/addtocart';
import 'components/authorization-link';
import 'components/autocomplete';
import 'components/breadcrumbs';
import 'components/button';
import 'components/container';
import 'components/cookie-message';
import 'components/dailydeal';
import 'components/display-controller';
import 'components/dropdown-switcher';
import 'components/field';
import 'components/footer';
import 'components/google-recaptcha';
import 'components/header';
import 'components/header/search';
import 'components/header/user-nav';
import 'components/headline';
import 'components/lazyload';
import 'components/links-block-addto';
import 'components/logo';
import 'components/messages';
import 'components/minicart-product';
import 'components/minicart';
import 'components/modal';
import 'components/navigation';
import 'components/newsletter';
import 'components/offcanvas-filters';
import 'components/offcanvas-navigation';
import 'components/offcanvas-toggle';
import 'components/offcanvas';
import 'components/page-bottom';
import 'components/page-title';
import 'components/price-box';
import 'components/product-tile';
import 'components/products-list';
import 'components/qty-increment';
import 'components/select';
import 'components/slider';
import 'components/social-media-list';
import 'components/star-rating';
import 'components/swatches';
import 'components/tabs';
import 'components/topbar';
import 'components/typography';
import 'components/video-teaser';
import 'components/visually-hidden';

/**
 * Category page specific components
 */
import 'pages/category';
import 'components/aftersearch-nav';
import 'components/search-results-cms';
import 'components/search-results-switcher';
import 'components/side-nav';
import 'components/toolbar';

/**
 * Optional components - can be imported in child themes entries
 */
// import 'components/page-scroll';
// import 'components/product-tile-list';
// import 'components/tile-gallery';
// import 'components/tooltip';
// import 'components/video-layer';

/**
 * Optional components that require optional modules being installed
 */
// import 'Amazon_Pay';
// import 'MageSuite_ShippingAddons';
// import 'MageSuite_QuickReorder/reorder-banner';
// import 'PluginCompany_ContactForms';
// import 'Smile_ElasticsuiteInstantSearch';
// import 'MageSuite_ElasticsuiteAjaxifier';
// import 'MageSuite_PWA';
