import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';

/**
 * Component options interface.
 * Please refer to swiper documentation and our teaser component for more options and callbacks
 *
 */
interface BrandCarouselOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-brand-carousel'
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
     * @default 50
     */
    spaceBetween?: number;

    /**
     * Maximum width of single slide (in px)
     * @type {number}
     * @default 50
     */
    slideMinWidth?: number;

    /**
     * Maximum number of groups that will be still visible as dots.
     * If you want pagination to always be dots you can either don't add
     * .${teaserName}__numbers element in HTML or set this to something big.
     * @type {number}
     * @default 10
     */
    paginationBreakpoint?: number;

    /**
     * Defines if slides should be centered
     * Default: false
     * @type {boolean}
     * @default false
     */
    centeredSlides?: boolean;

    /**
     * Rounds values of slides width and height
     * to prevent blurry texts on usual resolution screens
     * @type {boolean}
     * @default false
     */
    roundLengths?: boolean;

    /**
     * Object with options for breakpoints.
     * Please refer to swiper documentation
     * http://idangero.us/swiper/api/#parameters
     * @default null
     */
    breakpoints?: any;

    /**
     * Number of slides to duplicate.
     * You see dupicated slides when you swipe on sides/
     * @type {number}
     * @default 6
     */
    loopedSlides?: number;
}

export default class BrandCarousel {
    protected _$element: JQuery;
    protected _$items: JQuery;
    protected _breakpointsArray: any[];
    protected _teaserInstance: any;
    protected _currentWindowWidth = $(window).width();
    /**
     * Holds all settings that will be passed to csTeaser
     */
    protected _settings: any;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: BrandCarouselOptions) {
        this._settings = $.extend(
            true,
            {
                teaserName: 'cs-brand-carousel',
                slidesPerView: 6,
                spaceBetween: 50,
                slideMinWidth: 50,
                roundLengths: false,
                centeredSlides: false,
                calculateSlides: false,
                loop: true,
                loopedSlides: 6,
                breakpoints: {
                    380: {
                        slidesPerView: 2,
                        spaceBetween: 25,
                    },
                    480: {
                        slidesPerView: 3,
                        spaceBetween: 35,
                    },
                    640: {
                        slidesPerView: 4,
                    },
                    768: {
                        slidesPerView: 5,
                    },
                    960: {
                        slidesPerView: 5,
                    },
                },
                lazy: {
                    loadOnTransitionStart: true,
                },
            },
            options
        );

        this._$element = $element || $(`.${this._settings.teaserName}`);

        if (this._$element.length) {
            this._$items = this._$element.find(
                $(`.${this._settings.teaserName}__slide`)
            );
        }

        if (this._settings.breakpoints) {
            this._breakpointsArray = Object.keys(this._settings.breakpoints);
        }

        if (this._$element.length && this._$items.length > 1) {
            let throttler: number;
            const _this: any = this;

            $(window).on('resize', (): void => {
                const newWindowWidth = $(window).width();
                if (_this._currentWindowWidth !== newWindowWidth) {
                    clearTimeout(throttler);
                    throttler = setTimeout((): void => {
                        _this._init();
                    }, 250);
                    _this._currentWindowWidth = newWindowWidth;
                }
            });

            this._init();
        }
    }

    public getInstance(): any {
        return this._teaserInstance;
    }

    protected _getSlidesPerView(): number {
        let next: number = Math.max.apply(null, this._breakpointsArray);
        const wWidth: number = $(window).width();

        if (wWidth >= next) {
            return this._settings.slidesPerView;
        } else {
            for (let i: number = 0; i < this._breakpointsArray.length; i++) {
                const currentBreakpoint: number = parseInt(
                    this._breakpointsArray[i],
                    10
                );

                if (currentBreakpoint >= wWidth && currentBreakpoint < next) {
                    next = this._breakpointsArray[i];
                }
            }

            return this._settings.breakpoints[next].slidesPerView;
        }
    }

    /**
     * Initializes all $element's with previously defined options
     */
    protected _init(): void {
        if (this._breakpointsArray) {
            if (this._$items.length > this._getSlidesPerView()) {
                if (!this._teaserInstance) {
                    this._$element.addClass(
                        `${this._settings.teaserName}--slider`
                    );
                    this._teaserInstance = new csTeaser(
                        this._$element,
                        this._settings
                    );
                }
            } else {
                if (this._teaserInstance) {
                    this._teaserInstance.destroy();
                    this._$element
                        .removeClass(`${this._settings.teaserName}--slider`)
                        .find(`.${this._settings.teaserName}__slides`)
                        .removeAttr('style')
                        .find(`.${this._settings.teaserName}__slide`)
                        .removeAttr('style');
                    this._teaserInstance = undefined;
                }
            }
        } else {
            this._$element.addClass(`${this._settings.teaserName}--slider`);
            this._teaserInstance = new csTeaser(this._$element, this._settings);
        }
    }
}
