import $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';

/**
 * component options interface.
 * Please refer to swiper documentation and our teaser component for more options and callbacks
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

    /**
     * Autoplay in miliseconds
     * @type {number}
     * @default 5000
     */
    autoplay?: number;

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
    calculateSlides: boolean;

    /**
     * Tells if swiper should automatically round decimals in pixels
     * @type {boolean}
     * @default true
     */
    roundLengths: boolean;

    callbacks?: {
        /**
         * Fires right after hero has been initialized (once)
         * @type {function}
         */
        onInit?: any;
    };
}

export default class Hero {
    protected _$element: JQuery;
    protected _instance: any;
    protected options: HeroOptions;
    protected _swiperDefaults: any;

    /**
     * Creates new Hero component with optional settings.
     * @param {$element} Optional, element to be initialized as Hero component
     * @param {options}  Optional settings object.
     */
    public constructor($element?: JQuery, options?: HeroOptions) {
        const _this: any = this;
        const teaserName: string = (options && options.teaserName) || 'cs-hero';
        const pauseAutoplayOnHover: boolean =
            options && options.pauseAutoplayOnHover
                ? options.pauseAutoplayOnHover
                : true;

        this._$element = $element || $(`.${this._options.teaserName}`);

        this._swiperDefaults = {
            teaserName: teaserName,
            slidesPerView: 'auto',
            spaceBetween: 10,
            centeredSlides: true,
            autoplay: 5000,
            autoHeight: true,
            paginationBreakpoint: 50,
            slideToClickedSlide: true,
            loop: true,
            calculateSlides: false,
            roundLengths: true,
            autoplayDisableOnInteraction: true,
            pauseAutoplayOnHover: pauseAutoplayOnHover,
            onInit(swiper: any): void {
                if (pauseAutoplayOnHover) {
                    swiper.container.parents(`.${teaserName}`).on({
                        mouseenter(): void {
                            if (_this._instance) {
                                swiper.pauseAutoplay();
                                swiper.emit('onAutoplayPause', swiper);
                            }
                        },
                        mouseleave(): void {
                            if (
                                swiper.autoplayPaused &&
                                swiper.autoplaying &&
                                _this._instance
                            ) {
                                swiper.stopAutoplay();
                                swiper.startAutoplay();
                                swiper.emit('onAutoplayResume', swiper);
                            }
                        },
                    });
                }

                if (
                    options &&
                    options.callbacks &&
                    options.callbacks.onInit &&
                    typeof options.callbacks.onInit === 'function'
                ) {
                    options.callbacks.onInit(swiper);
                }
            },
        };

        this._options = $.extend(true, this._swiperDefaults, options);
        this._options.destroyForMobile =
            this._$element.hasClass(`${teaserName}--as-list-mobile`) ||
            this._$element.hasClass(`${teaserName}--hidden-mobile`)
                ? true
                : false;

        if (
            this._$element.find(`.${this._options.teaserName}__slide`).length >
            1
        ) {
            if (this._options.destroyForMobile) {
                this._toggleMobileHeros();

                $(window).on('resize', function(): void {
                    _this._toggleMobileHeros();
                });
            } else {
                this._initHeros();
            }
        } else {
            this._$element.addClass(`${this._options.teaserName}--static`);
        }
    }

    public getInstance(): any {
        return this._instance;
    }

    /**
     * Initializes heros
     */
    protected _initHeros(): void {
        this._instance = new csTeaser(this._$element, this._options);
    }

    /**
     * if mobileDisplayVariant was set to 'list' - initialize slider only for resolutions
     * greater than mobile
     */
    protected _toggleMobileHeros(): any {
        if ($(window).width() >= breakpoint.tablet) {
            if (!this._instance) {
                this._initHeros();
            }
        } else {
            if (this._instance) {
                this._instance.destroy();
                this._$element
                    .find(`.${this._options.teaserName}__slides`)
                    .removeAttr('style')
                    .find(`.${this._options.teaserName}__slide`)
                    .removeAttr('style');
                this._instance = undefined;
            }
        }
    }
}
