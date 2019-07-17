import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';

/**
 * Component options interface.
 * Please refer to swiper documentation and teaser component for more options and callbacks
 */
export interface ProductsCarouselOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-products-carousel'
     */
    teaserName?: string;

    /**
     * Product tile class
     * @type {string}
     * @default 'cs-product-tile'
     */
    productTile?: string;

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

    /**
     * Defines if products should be always a slider
     * Default: true
     * @type {boolean}
     */
    isSlider?: boolean;

    /**
     * Defines if products should be a carousel until given breakpoint
     * Default: false
     * @type {boolean}
     */
    isSliderMobile?: boolean;

    /**
     * Defines breakpoint, where carousel should be destroyed and products shall display as standard list view
     * Default: breakpoint.tablet
     * @type {number}
     */
    carouselBreakpoint?: number;

    /**
     * Defines default product tile view mode
     * Default: grid
     * @type {number}
     */
    viewMode?: number;

    callbacks?: {
        /**
         * Callbacks to fire on carousel events
         * @type {function}
         */
        onInit?: (swiperInstance: any) => void;
        onTransitionStart?: (swiperInstance: any) => void;
        onTransitionEnd?: (swiperInstance: any) => void;
        onResize?: (swiperInstance: any) => void;
    };
}

export default class ProductsCarousel {
    protected _$element: JQuery<HTMLElement>;
    protected _teaserInstance: any;
    protected _$window: JQuery = $(window);
    /**
     * Holds all settings that will be passed to csTeaser
     */
    protected _settings: any;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor(
        $element?: JQuery<HTMLElement>,
        options?: ProductsCarouselOptions
    ) {
        const _this = this;
        this._$element = $element || $(`.${this._settings.teaserName}`);
        this._settings = $.extend(
            true,
            {
                teaserName: 'cs-products-carousel',
                productTile: 'cs-product-tile',
                slidesPerView: 'auto',
                spaceBetween: 0,
                maxSlidesPerView: 4,
                slideMinWidth: 225,
                simulateTouch: false,
                isSliderMobile:
                    Boolean(this._$element.data('mobile-is-slider')) || false,
                viewMode: String(this._$element.data('view-mode')) || 'grid',
                carouselBreakpoint: breakpoint.tablet,
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
                        _this._onInit(swiper);
                        _this._fireCallback('onInit', swiper);
                    },
                    transitionStart: function() {
                        const swiper = this;
                        _this._onTransitionStart(swiper);
                        _this._fireCallback(
                            'onSlideChangeTransitionStart',
                            swiper
                        );
                    },
                    transitionEnd: function() {
                        const swiper = this;
                        _this._onTransitionEnd(swiper);
                        _this._fireCallback(
                            'onSlideChangeTransitionEnd',
                            swiper
                        );
                    },
                    resize: function() {
                        const swiper = this;
                        _this._onResize(swiper);
                        _this._fireCallback('onResize', swiper);
                    },
                },
            },
            options
        );

        if (this._settings.viewMode === 'list') {
            if (this._settings.isSliderMobile) {
                this._toggleMobileTeaser();

                window.addEventListener('resize', () => {
                    this._toggleMobileTeaser();
                });
            } else {
                this._$element.addClass(`${this._settings.teaserName}--list`);
                this._$element
                    .find(`.${this._settings.productTile}`)
                    .addClass(`${this._settings.productTile}--list`)
                    .removeClass(`${this._settings.productTile}--grid`);
            }
        } else {
            this._init();
        }
    }

    protected _fireCallback(callbackName, swiper: any) {
        const callbacks = this._settings.callbacks;
        if (
            callbacks &&
            callbacks[callbackName] &&
            typeof callbacks[callbackName] === 'function'
        ) {
            callbacks[callbackName](swiper);
        }
    }

    protected _onInit(swiper: any): void {
        this._handleOverflow(swiper);
    }

    protected _onTransitionStart(swiper: any): void {
        swiper.$el.parent().css('overflow', 'hidden');
        this._handleOverflow(swiper);
    }

    protected _onTransitionEnd(swiper: any): void {
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
        const itemsPerView: number = swiper.params.slidesPerView;
        const activeIndex: number = swiper.isEnd
            ? Math.max(swiper.slides.length - itemsPerView, 0)
            : swiper.activeIndex;
        const $itemsToShow: JQuery<HTMLUListElement> = $(swiper.slides).slice(
            activeIndex,
            activeIndex + itemsPerView
        );
        swiper.slides.removeClass(`${swiper.params.slideClass}--in-viewport`);
        $itemsToShow.addClass(`${swiper.params.slideClass}--in-viewport`);
    }

    protected _init(): void {
        this._teaserInstance = new csTeaser(this._$element, this._settings);
    }

    protected _toggleMobileTeaser(): void {
        if (this._$window.width() < this._settings.carouselBreakpoint) {
            if (!this._teaserInstance) {
                this._$element
                    .removeClass(`${this._settings.teaserName}--list`)
                    .find(`.${this._settings.productTile}`)
                    .addClass(`${this._settings.productTile}--grid`)
                    .removeClass(`${this._settings.productTile}--list`);
                this._init();
            }
        } else {
            if (this._teaserInstance) {
                this._teaserInstance.destroy();
                this._teaserInstance = undefined;
            }
            this._$element
                .addClass(`${this._settings.teaserName}--list`)
                .find(`${this._settings.teaserName}__slides`)
                .removeAttr('style')
                .find(`${this._settings.teaserName}__slide`)
                .removeAttr('style');
            this._$element
                .find(`.${this._settings.productTile}`)
                .addClass(`${this._settings.productTile}--list`)
                .removeClass(`${this._settings.productTile}--grid`);
        }
    }
}
