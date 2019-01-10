import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';

/**
 * component options interface.
 * Please refer to swiper documentation and our teaser component for more options and callbacks
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
}

export default class ProductsCarousel {
    protected _$element: JQuery<HTMLElement>;
    protected _options: any;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: ProductsCarouselOptions) {
        this._options = $.extend(
            {
                teaserName: 'cs-products-carousel',
                slidesPerView: 'auto',
                spaceBetween: 0,
                maxSlidesPerView: 4,
                slideMinWidth: 225,
                simulateTouch: false,
                onPaginationRendered(swiper: any): void {
                    swiper.bullets.length <= 1
                        ? $(swiper.paginationContainer).hide()
                        : $(swiper.paginationContainer).show();
                },
            },
            options
        );

        this._$element = $element || $(`.${this._options.teaserName}`);

        this._handleCallbacks();
        this._init();
    }

    /**
     * initializes swiper callback if provided in component options
     * @param callback {Function} custom callback function.
     * @param swiper {Object} swiper instance object defined in this._options.
     */
    protected _initCallback(callback: any, swiper: any): void {
        if (callback && typeof(callback) === 'function') {
            callback(swiper);
        }
    }

    /**
     * Modifies callbacks provided in options to insert some custom logic (a'la middleware)
     */
    protected _handleCallbacks(): void {
        const onInitCallback = this._options.onInit;
        const onSlideChangeStartCallback = this._options.onSlideChangeStart;
        const onSlideChangeEndCallback = this._options.onSlideChangeEnd;
        const onAfterResizeCallback = this._options.onAfterResize;

        this._options.onInit = (swiper: any): any => this._onInit(swiper, onInitCallback);
        this._options.onSlideChangeStart = (swiper: any): any => this._onSlideChangeStart(swiper, onSlideChangeStartCallback);
        this._options.onSlideChangeEnd = (swiper: any): any => this._onSlideChangeEnd(swiper, onSlideChangeEndCallback);
        this._options.onAfterResize = (swiper: any): any => this._onAfterResize(swiper, onAfterResizeCallback);
    }

    /**
     * Modified swiper's onInit callback, so that first it runs some logic and then fires original onInit callback passed in options object
     * @param swiper {Object} swiper instance object.
     * @param callback {Function} custom callback function defined in this._options.
     */
    protected _onInit(swiper: any, callback: any): void {
        this._handleOverflow(swiper);
        //this._$element.addClass(`${this._options.teaserName}--ready`);
        this._initCallback(callback, swiper);
    }

    /**
     * Modified swiper's onSlideChangeStart callback, so that first it runs some logic and then fires original onSlideChangeStart callback passed in options object
     * @param swiper {Object} swiper instance object.
     * @param callback {Function} custom callback function defined in this._options.
     */
    protected _onSlideChangeStart(swiper: any, callback: any): void {
        swiper.container.parent().css('overflow', 'hidden');
        this._handleOverflow(swiper);
        this._initCallback(callback, swiper);
    }

    /**
     * Modified swiper's onSlideChangeEnd callback, so that first it runs some logic and then fires original onSlideChangeEnd callback passed in options object
     * @param swiper {Object} swiper instance object.
     * @param callback {Function} custom callback function defined in this._options.
     */
    protected _onSlideChangeEnd(swiper: any, callback: any): void {
        swiper.container.parent().css('overflow', '');
        this._initCallback(callback, swiper);
    }

    /**
     * Modified swiper's onAfterResize callback, so that first it runs some logic and then fires original onAfterResize callback passed in options object
     * @param swiper {Object} swiper instance object.
     * @param callback {Function} custom callback function defined in this._options.
     */
    protected _onAfterResize(swiper: any, callback: any): void {
        this._handleOverflow(swiper);
        this._initCallback(callback, swiper);
    }

    /**
     * Custom logic for showin/hidding slides based on `--in-viewport` slide modifier.
     * Reason: we want to use native :hover and get rid of cloning whole product tile. We couldn't do it because of `overflow:hidden` applied on carousel. This modification allows us to use `overflow:visible` for carousel
     * @param swiper {Object} swiper instance object.
     */
    protected _handleOverflow(swiper: any): void {
        swiper.slides.removeClass(`${swiper.params.slideClass}--in-viewport`);

        const itemsPerView: number = swiper.currentSlidesPerView();
        const activeIndex: number = swiper.isEnd ? swiper.slides.length - itemsPerView : swiper.activeIndex;
        const $itemsToShow: JQuery<HTMLOListElement> = swiper.slides.slice(activeIndex, activeIndex + itemsPerView);

        $itemsToShow.addClass(`${swiper.params.slideClass}--in-viewport`);
    }

    /**
     * Initializes all $element's with previously defined options
     */
    protected _init(): void {
        const teaserOptions: any = this._options;

        if (this._$element.length) {
            this._$element
                .filter(`:not(.${this._options.teaserName}--grid)`)
                .each(function(): any {
                    return new csTeaser($(this), teaserOptions);
                });
        }
    }
}
