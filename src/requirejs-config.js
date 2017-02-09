var config = {
    paths: {
        'Swiper': 'swiper',
        'vendors': 'vendors',
        'Stickyfill': 'stickyfill',
        'isMobile': 'ismobile',
    },
    shim: {
        'vendors': {
            deps: [
                'jquery',
            ],
        },
        'Stickyfill': {
            deps: [
                'jquery',
            ],
            exports: 'Stickyfill',
        },
        'isMobile': {
            exports: 'isMobile',
        },
    }
};
