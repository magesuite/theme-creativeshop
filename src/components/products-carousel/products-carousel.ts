import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';

/**
 * Component options interface.
 * Please refer to swiper documentation and teaser component for more options and callbacks
 */
interface ProductsCarouselOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-products-carousel'
     */
    teaserName?: string;

    /**
     * Slides per viewport
     * @type {string / number}
     * @default 'auto'
     */
    slidesPerView?: any;

    /**
     * Space between slides (in px)
     * @type {number}
     * @default 16
     */
    spaceBetween?: number;

    /**
     * Maximum slides per viewport (for very large screens and dependable on containers max-width)
     * @type {number}
     * @default 5
     */
    maxSlidesPerView?: number;

    /**
     * Maximum width of single slide (in px)
     * @type {number}
     * @default 220
     */
    slideMinWidth?: number;

    callbacks?: {
        /**
         * Callbacks to fire on carousel events
         * @type {function}
         */
        onInit?: (swiperInstance: any) => void,
        onSlideChangeTransitionStart?: (swiperInstance: any) => void,
        onSlideChangeTransitionEnd?: (swiperInstance: any) => void,
        onResize?: (swiperInstance: any) => void
    };
}

export default class ProductsCarousel {
    protected _$element: JQuery<HTMLElement>;
    protected _teaserInstance: any;
     /**
     * Holds all settings that will be passed to csTeaser
     */
    protected _settings: any;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery<HTMLElement>, options?: ProductsCarouselOptions) {
        const _this = this;
        this._$element = $element || $(`.${this._settings.teaserName}`);
        this._settings = $.extend(true,
            {
                teaserName: 'cs-products-carousel',
                slidesPerView: 'auto',
                spaceBetween: 0,
                maxSlidesPerView: 4,
                slideMinWidth: 225,
                simulateTouch: false,
                on: {
                    paginationRender: function() {
                        /**
                         * "this" in swiper events refers to the swiper instance
                         */
                        const swiper = this;
                        swiper.pagination.bullets.length <= 1
                            ? $(swiper.pagination.el).hide()
                            : $(swiper.pagination.el).show();
                    },
                    init: function() {
                        const swiper = this;
                        _this._onInit(swiper)
                        _this._fireCallback('onInit', swiper);
                    },
                    slideChangeTransitionStart: function() {
                        const swiper = this;
                        _this._onSlideChangeTransitionStart(swiper)
                        _this._fireCallback('onSlideChangeTransitionStart', swiper);
                    },
                    slideChangeTransitionEnd: function() {
                        const swiper = this;
                        _this._onSlideChangeTransitionEnd(swiper)
                        _this._fireCallback('onSlideChangeTransitionEnd', swiper);
                    },
                    resize: function() {
                        const swiper = this;
                        _this._onResize(swiper)
                        _this._fireCallback('onResize', swiper);
                    }
                }
            },
            options
        );

        this._init();
    }

    protected _fireCallback(callbackName, swiper: any) {
        const callbacks = this._settings.callbacks;
        if (
            callbacks &&
            callbacks[callbackName] &&
            typeof(callbacks[callbackName]) === 'function'
        ) {
            callbacks[callbackName](swiper);
        }
    }

    protected _onInit(swiper: any): void {
        this._handleOverflow(swiper);
    }

    protected _onSlideChangeTransitionStart(swiper: any): void {
        swiper.$el.parent().css('overflow', 'hidden');
        this._handleOverflow(swiper);
    }

    protected _onSlideChangeTransitionEnd(swiper: any): void {
        swiper.$el.parent().css('overflow', '');
    }

    protected _onResize(swiper: any): void {
        this._handleOverflow(swiper);
    }

    /**
     * Custom logic for showing/hidding slides based on `--in-viewport` slide modifier.
     * Reason: we want to use native :hover and get rid of cloning whole product tile.
     * We couldn't do it because of `overflow:hidden` applied on carousel.
     * This modification allows us to use `overflow:visible` for carousel
     * @param swiper {Object} swiper instance object.
     */
    protected _handleOverflow(swiper: any): void {
        swiper.slides.removeClass(`${swiper.params.slideClass}--in-viewport`);

        const itemsPerView: number = swiper.params.slidesPerView;
        const activeIndex: number = swiper.isEnd ? swiper.slides.length - itemsPerView : swiper.activeIndex;
        const $itemsToShow: JQuery<HTMLUListElement> = $(swiper.slides).slice(activeIndex, activeIndex + itemsPerView);

        $itemsToShow.addClass(`${swiper.params.slideClass}--in-viewport`);
    }

    protected _init(): void {
        this._teaserInstance = new csTeaser(this._$element, this._settings);
    }
}
