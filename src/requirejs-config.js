var config = {
    paths: {
        bundle: 'js/bundle',
        Swiper: 'js/vendor/swiper',
        dropdown: 'js/vendor/bootstrap-dropdown',
        selectpicker: 'js/vendor/bootstrap-select',
        vendors: 'vendors',
        Stickyfill: 'js/vendor/stickyfill',
        isMobile: 'js/vendor/ismobile',
        bootstrapDropdown: 'js/vendor/bootstrap-dropdown',
        bootstrapSelect: 'js/vendor/bootstrap-select',
    },
    shim: {
        isMobile: {
            exports: 'isMobile',
        },
        bootstrapDropdown: ['jquery'],
        bootstrapSelect: ['jquery', 'bootstrapDropdown'],
    },
    config: {
        mixins: {
            'mage/collapsible': {
                'js/collapsible-ext': true,
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
            'Magento_Checkout/js/region-updater': {
                'Magento_Checkout/js/region-updater-ext': true,
            },
            'Magento_PageCache/js/page-cache': {
                'Magento_PageCache/js/submit-button-enabler': true,
            },
            'Smile_ElasticsuiteCore/js/form-mini': {
                'Smile_ElasticsuiteCore/js/form-mini-ext': true,
            },
            'Magento_CheckoutAgreements/js/view/checkout-agreements': {
                'Magento_CheckoutAgreements/js/view/checkout-agreements-ext': true,
            },
            'Magento_CheckoutAgreements/js/model/agreement-validator': {
                'Magento_CheckoutAgreements/js/model/agreement-validator-ext': true,
            },
            'Magento_CheckoutAgreements/js/model/agreements-assigner': {
                'Magento_CheckoutAgreements/js/model/agreements-assigner-ext': true,
            },
        },
    },
    map: {
        '*': {
            checkoutCustomizations:
                'Magento_Checkout/js/checkout-customizations',
        },
    },
};
