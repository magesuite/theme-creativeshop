var config = {
    paths: {
        Swiper: 'swiper',
        vendors: 'vendors',
        Stickyfill: 'stickyfill',
        isMobile: 'ismobile',
    },
    shim: {
        vendors: {
            deps: ['jquery'],
        },
        isMobile: {
            exports: 'isMobile',
        },
    },
    config: {
        mixins: {
            'Magento_Checkout/js/view/summary/cart-items': {
                'Magento_Checkout/js/view/summary/cart-items-ext': true,
            },
            'Magento_Checkout/js/view/minicart': {
                'Magento_Checkout/js/view/minicart-ext': true,
            },
            'Magento_Checkout/js/view/shipping': {
                'Magento_Checkout/js/view/shipping-ext': true,
            },
        },
    },
};
