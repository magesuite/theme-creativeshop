/**
 * Product Details Page entry point.
 * It imports all the components required by PDP.
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
import 'components/offcanvas-navigation';
import 'components/offcanvas-toggle';
import 'components/offcanvas';
import 'components/page-bottom';
import 'components/page-title';
import 'components/price-box';
import 'components/product-navigation';
import 'components/product-tile';
import 'components/products-list';
import 'components/qty-increment';
import 'components/select';
import 'components/slider';
import 'components/social-media-list';
import 'components/star-rating';
import 'components/swatches';
import 'components/table';
import 'components/tabs';
import 'components/topbar';
import 'components/typography';
import 'components/video-teaser';
import 'components/visually-hidden';

/**
 * Content Constructor components styles included in bundles
 */
import 'components/image-teaser/image-teaser.scss';
import 'components/products-carousel/products-carousel.scss';
import 'components/paragraph/paragraph.scss';
import 'components/separator/separator.scss';

/**
 * PDP specific components
 */
import 'pages/product';
import 'components/bundle-box';
import 'components/buybox';
import 'components/captcha';
import 'components/form';
import 'components/indicators';
import 'components/product-details';
import 'components/product-details/additional';
import 'components/product-details/description';
import 'components/product-details/main';
import 'components/product-details/nav';
import 'components/product-gallery';
import 'components/review';
import 'components/reviews-summary';
import 'components/reviews';
import 'components/toolbar';

/**
 * Optional components - can be imported in child themes entries
 */
// import 'components/authentication-modal';
// import 'components/page-scroll';
// import 'components/product-details/attachments';
// import 'components/product-tile-list';
// import 'components/tile-gallery';
// import 'components/tooltip';
// import 'components/video-layer';

/**
 * Optional components that require optional modules being installed
 */
// import 'Amazon_Pay';
// import 'MageSuite_InstantPurchase';
// import 'MageSuite_ProductVariants';
// import 'MageSuite_PwaNotifications';
// import 'MageSuite_ShippingAddons';
// import 'MageSuite_ProductSlideGallery';
// import 'MageSuite_QuickReorder/reorder-banner';
// import 'PluginCompany_ContactForms';
// import 'Smile_ElasticsuiteInstantSearch';
// import 'MageSuite_Pwa';
