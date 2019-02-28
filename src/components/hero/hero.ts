import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';

/**
 * Component options interface.
 * Please refer to Swiper documentation (http://idangero.us/swiper/api/)
 * and teaser component for more options and callbacks
 */
interface HeroOptions {
    /**
     * HTML Class of the component
     * @type {string}
     * @default 'cs-products-promo'
     */
    teaserName?: string;

    /**
     * Slides per viewport
     * @type {string: 'auto' / number}
     * @default 'auto'
     */
    slidesPerView?: any;

    /**
     * Space between slides (in px)
     * @type {number}
     * @default 10
     */
    spaceBetween?: number;

    /**
     * Tells if slides should be centered relative to viewport
     * @type {boolean}
     * @default true
     */
    centeredSlides?: boolean;

    autoplay?: {
        /**
        * Autoplay delay
        * @type {number}
        * @default 5000
        */
        delay?: number;
    };

    /**
     * Tells component if height of slider should be automatically adjusted every slide
     * to the height of the highest visible slide
     * or if false, height will be set permanently to the height of the highest slide in whole component
     * @type {boolean}
     * @default true
     */
    autoHeight?: number;

    /**
     * Allows to set point where pagination is a set of bullets or fraction type
     * @type {number}
     * @default 50
     */
    paginationBreakpoint?: number;

    /**
     * If prev/next slide is visible, tells if click on any of them should swiper to it
     * @type {boolean}
     * @default true
     */
    slideToClickedSlide?: boolean;

    /**
     * Stop autoplay on any interaction.
     * Hover pauses autoplay, while any click inside hero will stop it permanently
     * @type {boolean}
     * @default true
     */
    pauseAutoplayOnHover?: boolean;

    /**
     * Tells if slides should be looped
     * @type {boolean}
     * @default true
     */
    loop?: boolean;

    /**
     * Tells if swiper should automatically calculate slides based on width of slides
     * @type {boolean}
     * @default false
     */
    calculateSlides?: boolean;

    /**
     * Tells if swiper should automatically round decimals in pixels
     * @type {boolean}
     * @default true
     */
    roundLengths?: boolean;

    callbacks?: {
        /**
         * Fires right after hero has been initialized (once)
         * @type {function}
         */
        onInit?: (swiperInstance: any) => void;
    };
}

export default class Hero {
    protected _$element: JQuery<HTMLElement>;
    protected _teaserInstance: any;
    /**
     * Holds all settings for the hero, which are be passed to csTeaser
     */
    protected _settings: any;

    /**
     * Creates new Hero component with optional settings.
     * @param {$element} Optional, element to be initialized as Hero component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: HeroOptions) {
        const _this: any = this;
        const teaserName: string = (options && options.teaserName) || 'cs-hero';
        this._$element = $element ? $element : $(`.${options.teaserName}`);

        /**
         * Default options
         */
        const defaultOptions = {
            teaserName: teaserName,
            loop: true,
            loopedSlides: 5,
            spaceBetween: 2,
            centeredSlides: true,
            slideToClickedSlide: true,
            autoplay: {
                delay: 5000,
            },
            autoHeight: true,
            roundLengths: true,
            paginationBreakpoint: 50,
            calculateSlides: false,
            pauseAutoplayOnHover: true,
            on: {
                init: function() {
                    /**
                     * "this" in swiper event listeners refers to swiper instance
                     */
                    const swiperInstance = this;
                    if (_this._settings.pauseAutoplayOnHover) {
                        const $hero = swiperInstance.$el.parents(`.${teaserName}`);
                        $hero.on('mouseenter', _this._autoplayPauseMouseEnterHandler);
                        $hero.on('mouseleave', _this._autoplayPauseMouseLeaveHandler);
                    }

                    _this._fireCallback("onInit", swiperInstance)
                },
                beforeDestroy: function() {
                    /**
                     * Remove autoplay start/stop events on swiper destroy.
                     * "this" in swiper event listeners refers to swiper instance
                     */
                    const swiperInstance = this;
                    if (_this._settings.pauseAutoplayOnHover) {
                        const $hero = swiperInstance.$el.parents(`.${teaserName}`);
                        $hero.off('mouseenter', _this._autoplayPauseMouseEnterHandler);
                        $hero.off('mouseleave', _this._autoplayPauseMouseLeaveHandler);
                    }
                }
            }
        };

        this._settings = $.extend(true, defaultOptions, options);

        const destroyForMobile =
            this._$element.hasClass(`${teaserName}--as-list-mobile`) ||
            this._$element.hasClass(`${teaserName}--hidden-mobile`)

        if (
            this._$element.find(`.${this._settings.teaserName}__slide`).length > 1
        ) {
            if (destroyForMobile) {
                this._toggleMobileHeros();

                $(window).on('resize', (): void => {
                    this._toggleMobileHeros();
                });
            } else {
                this._initHeros();
            }
        } else {
            this._$element.addClass(`${this._settings.teaserName}--static`);
        }
    }

    public getInstance(): any {
        return this._teaserInstance;
    }

    /**
     * Initializes heros
     */
    protected _initHeros(): void {
        this._teaserInstance = new csTeaser(this._$element, this._settings);
    }

    /**
     * if mobileDisplayVariant was set to 'list' - initialize slider only for resolutions
     * greater than mobile
     */
    protected _toggleMobileHeros(): any {
        if ($(window).width() >= breakpoint.tablet) {
            if (!this._teaserInstance) {
                this._initHeros();
            }
        } else {
            if (this._teaserInstance) {
                this._teaserInstance.destroy();
                this._$element
                    .find(`.${this._settings.teaserName}__slides`)
                    .removeAttr('style')
                    .find(`.${this._settings.teaserName}__slide`)
                    .removeAttr('style');
                this._teaserInstance = undefined;
            }
        }
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

    protected _autoplayPauseMouseEnterHandler = (): void => {
        const swiperInstance = this.getInstance().getSwiper()
        if (swiperInstance) {
            swiperInstance.autoplay.stop();
        }
    }

    protected _autoplayPauseMouseLeaveHandler = (): void => {
        const swiperInstance = this.getInstance().getSwiper()
        if (swiperInstance) {
            swiperInstance.autoplay.start();
        }
    }
}
