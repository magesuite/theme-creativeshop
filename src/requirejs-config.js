var config = {
    paths: {
        dropdown: 'js/vendor/bootstrap-dropdown',
        selectpicker: 'js/vendor/bootstrap-select',
        vendors: 'vendors',
        ccImageTeaser: 'js/image-teaser',
        ccImageTeaserLegacy: 'js/image-teaser-legacy',
        ccAccordion: 'js/accordion',
        ccSeparator: 'js/separator',
        ccBrandCarousel: 'js/brand-carousel',
        ccCategoryLinks: 'js/category-links',
        ccDailyDealTeaser: 'js/daily-deal-teaser',
        ccParagraph: 'js/paragraph',
        ccProductsCarousel: 'js/products-carousel',
        ccProductFinder: 'js/product-finder',
        mgsSalebarWidget: 'js/salebar-widget',
        mgsOffcanvas: 'js/offcanvas',
        mgsInstantProductFinder: 'js/instant-product-finder',
    },
    shim: {
        'mage/dataPost': ['js/uenc-updater'],
    },
    config: {
        mixins: {
            /**
             * Some of the mixins point to full path + module aliases. It solves the issue:
             * https://github.com/magento/magento2/issues/33593#issuecomment-1040116318
             */
            'collapsible': {
                'js/collapsible-ext': true,
            },
            'mage/collapsible': {
                'js/collapsible-ext': true,
            },
            'dropdownDialog': {
                'js/dropdown-ext': true,
            },
            'mage/dropdown': {
                'js/dropdown-ext': true,
            },
            'mage/validation': {
                'js/validation-ext': true,
            },
            'catalogAddToCart': {
                'Magento_Catalog/js/catalog-add-to-cart-ext': true,
            },
            'Magento_Catalog/js/catalog-add-to-cart': {
                'Magento_Catalog/js/catalog-add-to-cart-ext': true,
            },
            'Magento_Ui/js/view/messages': {
                'Magento_Ui/js/view/messages-ext': true,
            },
            'Magento_Catalog/js/product/view/provider': {
                'Magento_Catalog/js/product/view/provider-ext': true,
            },
            'Magento_Checkout/js/model/checkout-data-resolver': {
                'Magento_Checkout/js/model/checkout-data-resolver-ext': true,
            },
            'Magento_Checkout/js/view/summary/cart-items': {
                'Magento_Checkout/js/view/summary/cart-items-ext': true,
            },
            'Magento_Checkout/js/view/shipping': {
                'Magento_Checkout/js/view/shipping-ext': true,
            },
            'sidebar': {
                'Magento_Checkout/js/sidebar-ext': true,
            },
            'Magento_Checkout/js/sidebar': {
                'Magento_Checkout/js/sidebar-ext': true,
            },
            'regionUpdater': {
                'Magento_Checkout/js/region-updater-ext': true,
            },
            'Magento_Checkout/js/region-updater': {
                'Magento_Checkout/js/region-updater-ext': true,
            },
            'Magento_Checkout/js/model/step-navigator': {
                'Magento_Checkout/js/model/step-navigator-ext': true,
            },
            'quickSearch': {
                'Smile_ElasticsuiteCore/js/form-mini-ext': true,
            },
            'Smile_ElasticsuiteCore/js/form-mini': {
                'Smile_ElasticsuiteCore/js/form-mini-ext': true,
            },
            'Smile_ElasticsuiteCatalog/js/range-slider-widget': {
                'Smile_ElasticsuiteCatalog/js/range-slider-widget-ext': true,
            },
            'Magento_CheckoutAgreements/js/view/checkout-agreements': {
                'Magento_CheckoutAgreements/js/view/checkout-agreements-ext': true,
            },
            'rangeSlider': {
                'Magento_CheckoutAgreements/js/model/agreement-validator-ext': true,
            },
            'Magento_CheckoutAgreements/js/model/agreement-validator': {
                'Magento_CheckoutAgreements/js/model/agreement-validator-ext': true,
            },
            'Magento_CheckoutAgreements/js/model/agreements-assigner': {
                'Magento_CheckoutAgreements/js/model/agreements-assigner-ext': true,
            },
            'Magento_Catalog/js/validate-product': {
                'Magento_Catalog/js/swatches-validation-ext': true,
            },
            'Magento_Swatches/js/swatch-renderer': {
                'Magento_Swatches/js/swatch-renderer-ext': true,
                'Magento_Swatches/js/swatch-renderer-referrer-ext': false,
            },
            'MageSuite_ServerSideSwatches/js/swatch-renderer': {
                'Magento_Swatches/js/swatch-renderer-ext': true,
                'Magento_Swatches/js/swatch-renderer-referrer-ext': false,
            },
            'PluginCompany_ContactForms/js/form': {
                'PluginCompany_ContactForms/js/form-ext': true,
            },
            'relatedProducts': {
                'Magento_Catalog/js/related-products-ext': true,
            },
            'Magento_Catalog/js/related-products': {
                'Magento_Catalog/js/related-products-ext': true,
            },
            'Magento_Ui/js/form/element/abstract': {
                'Magento_Ui/js/form/element/abstract-ext': true,
            },
            'Magento_Checkout/js/view/summary/item/details': {
                'Magento_Checkout/js/view/summary/item/details-ext': true,
            },
            'Magento_Checkout/js/model/payment-service': {
                'Magento_Checkout/js/model/payment-service-ext': true,
            },
            'Magento_Review/js/process-reviews': {
                'Magento_Review/js/process-reviews-ext': true,
            },
            'slide': {
                'Magento_Bundle/js/slide-ext': true,
            },
            'Magento_Bundle/js/slide': {
                'Magento_Bundle/js/slide-ext': true,
            },
            'Magento_PageCache/js/page-cache': {
                'Magento_PageCache/js/submit-button-enabler': true,
            },
        },
    },
};

/**
 * Load promise polyfill if needed.
 */
if (
    'navigator' in window && // Check if we are not executing in baler
    (!('Promise' in window) || !('finally' in window.Promise.prototype))
) {
    config.deps.push('js/vendor/promisePolyfill');
}
