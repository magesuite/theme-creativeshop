var config = {
    paths: {
        'Swiper': 'swiper',
        'vendors': 'vendors',
        'Stickyfill': 'stickyfill',
        'isMobile': 'ismobile',
        'cssPolyfills': 'csspolyfills',
    },
    shim: {
        'vendors': {
            deps: [
                'jquery',
            ],
        },
        'isMobile': {
            exports: 'isMobile',
        },
        'cssPolyfills': {
            export: 'cssPolyfills',
        },
    },
    config: {
        mixins: {
            'Magento_Checkout/js/view/summary/cart-items': {
                'Magento_Checkout/js/view/summary/cart-items-ext': true
            }
        }
    }
};
