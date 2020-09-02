import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';
import VideoPlayer from 'components/video-player/video-player';

/**
 * component options interface.
 */
interface ImageTeaserLegacyOptions {
    /**
     * Classname of image teaser
     * Default: 'cs-image-teaser-legacy'
     * @type {string}
     */
    teaserName?: string;

    /**
     * Space between slides
     * Default: 8
     * @type {number}
     */
    spaceBetween?: number;

    /**
     * Slides visible at one time when carousel mode is enabled
     * Default: 1
     * @type {number}
     */
    slidesPerView?: number;

    /**
     * Defines for how many slides carousel should be moved after prev/next click
     * Default: same as slidesPerView
     * @type {number}
     */
    slidesPerGroup?: number;

    /**
     * Defines if teaser should be always a slider
     * Default: false
     * @type {boolean}
     */
    isSlider?: boolean;

    /**
     * Defines if slides should be centered
     * Default: false
     * @type {boolean}
     */
    centeredSlides?: boolean;

    /**
     * Defines if teaser should be a carousel until given breakpoint
     * Default: false
     * @type {boolean}
     */
    isSliderMobile?: boolean;

    callbacks?: {
        /**
         * Fires right after image-teaser-legacy init (once)
         * @type {function}
         */
        onInit?: (swiperInstance: any) => void;
    };

    /**
     * Tells if videos shall be handled
     * @type {boolean}
     * @default true
     */
    allowVideos?: boolean;

    /**
     * Defines breakpoint, where carousel should be destroyed and teaser shall display as standard image teaser
     * Default: breakpoint.tablet
     * @type {number}
     */
    carouselBreakpoint?: number;

    /**
     * Defines carousel behaviour depending on given fallback
     * Default: {
     *     breakpoint.tablet - 1
     * }
     * @type {Object}
     */
    breakpoints?: any;
}

export default class ImageTeaserLegacy {
    public _videoPlayer: any;
    /**
     * Holds all settings for the image-teaser-legacy, which are be passed to csTeaser
     */
    public _settings: any;
    protected _$container: JQuery;
    protected _swiperDefaults: object;
    protected _settingsOverrides: any;
    protected _teaserInstance: any;
    protected _$videosTriggers: JQuery;
    /**
     * Fields for setting navigation position for lazy loaded images
     */
    protected _lazyLoadedImages = [];
    protected _lazyImageResizeEventHandlerAdded = false;

    /**
     * Creates new ImageTeaserLegacy component with optional settings.
     * @param  {ImageTeaserLegacy} options  Optional settings object.
     */
    public constructor(
        $element: JQuery<HTMLElement>,
        options?: ImageTeaserLegacyOptions
    ) {
        this._$container = $element;
        const _this = this;
        const defaultOptions: any = {
            teaserName: 'cs-image-teaser-legacy',
            allowVideos: true,
            videoModalClass: 'cs-image-teaser-legacy__modal',
            carouselBreakpoint: breakpoint.tablet,
        };

        const maxMobileWidth: number = breakpoint.tablet - 1;
        const swiperDefaults = {
            spaceBetween: 8,
            slidesPerView:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            slidesPerGroup:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            isSlider: Boolean(this._$container.data('is-slider')) || false,
            isSliderMobile:
                Boolean(this._$container.data('mobile-is-slider')) || false,
            loop: true,
            centeredSlides: false,
            breakpoints: {
                [maxMobileWidth]: {
                    slidesPerView:
                        parseInt(
                            this._$container.data('mobile-items-per-view'),
                            10
                        ) ||
                        parseInt(this._$container.data('items-per-view'), 10) ||
                        1,
                    slidesPerGroup:
                        parseInt(
                            this._$container.data('mobile-items-per-view'),
                            10
                        ) ||
                        parseInt(this._$container.data('items-per-view'), 10) ||
                        1,
                },
            },
            preloadImages: false,
            lazy: {
                loadPrevNext: true,
                loadOnTransitionStart: true,
            },
            on: {
                init: function() {
                    /**
                     * "this" in swiper events refers to the swiper instance
                     */
                    _this._fireCallback('onInit', this);
                },
                lazyImageReady: function(slide, image) {
                    const swiperInstance = this;
                    _this._handleLazyImageReadyEvent(swiperInstance, image);
                },
            },
        };

        this._settings = $.extend(
            true,
            defaultOptions,
            swiperDefaults,
            options
        );
        this._settingsOverrides = this._getDataAttrOverrideSettings();
        if (this._settingsOverrides) {
            this._settings = $.extend(
                true,
                this._settings,
                this._settingsOverrides
            );
        }

        if (this._settings.isSlider) {
            this._initTeaser(this._$container);
        }

        if (this._settings.isSliderMobile && !this._settings.isSlider) {
            const _this: any = this;

            this._toggleMobileTeaser();

            $(window).on('resize', function(): void {
                _this._toggleMobileTeaser();
            });
        }

        if (this._settings.allowVideos) {
            this._videoPlayer = new VideoPlayer();
        }
    }

    public getInstance(): any {
        return this._teaserInstance;
    }

    protected _getDataAttrOverrideSettings(): any {
        let result: any;
        const dataAttrCfg: any = this._$container.data('js-configuration');

        if (dataAttrCfg) {
            try {
                result = JSON.parse(JSON.stringify(dataAttrCfg));
            } catch (err) {
                // tslint:disable-next-line
                console.warn(
                    `Could not parse settings from data-attribute: ${err}`
                );
            }
        }

        return result;
    }

    /**
     * Initializes teaser
     */
    protected _initTeaser($element: JQuery): void {
        this._teaserInstance = new csTeaser($element, this._settings);
    }

    /**
     * Initializes teaser only for mobiles
     */
    protected _toggleMobileTeaser(): void {
        if ($(window).width() < this._settings.carouselBreakpoint) {
            if (!this._teaserInstance) {
                this._$container.addClass(
                    `${this._settings.teaserName}--slider`
                );
                this._initTeaser(this._$container);
            }
        } else {
            if (this._teaserInstance) {
                this._teaserInstance.destroy();
                this._$container
                    .removeClass(`${this._settings.teaserName}--slider`)
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
            typeof callbacks[callbackName] === 'function'
        ) {
            callbacks[callbackName](swiper);
        }
    }

    /**
     * Adds handler for setting navigation position correctly when outside texts are enabled.
     * It centers navigation relatively to image, not whole slide container.
     * @TODO: get rid of this if possible after refactoring teaser bridge
     */
    protected _handleLazyImageReadyEvent(swiperInstance: any, image): void {
        this._lazyLoadedImages.push(image);

        if (
            $(swiperInstance.$el).hasClass(
                `${this._settings.teaserName}__wrapper--content-display-outside`
            ) &&
            swiperInstance.navigation.prevEl &&
            swiperInstance.navigation.nextEl &&
            this._lazyLoadedImages.length >= swiperInstance.params.slidesPerView
        ) {
            let throttler: ReturnType<typeof setTimeout>;
            let $tallestImage: any;

            const setNavButtonsPosition: any = () => {
                if (
                    $(window).width() >= breakpoint.tablet &&
                    $(swiperInstance.$el).parents(
                        `.${this._settings.teaserName}--slider`
                    ).length
                ) {
                    let h: number = 0;

                    swiperInstance.slides.each(
                        (idx: number, slide: any): void => {
                            const $img: any = $(slide).find(
                                `.${this._settings.teaserName}__image`
                            );
                            if ($img.length && $img.outerHeight() > h) {
                                $tallestImage = $img;
                                h = $tallestImage.outerHeight();
                            }
                        }
                    );

                    if ($tallestImage.length) {
                        const newNavPosition: number = h / 2;
                        $(swiperInstance.navigation.prevEl).css(
                            'top',
                            newNavPosition
                        );
                        $(swiperInstance.navigation.nextEl).css(
                            'top',
                            newNavPosition
                        );
                    }
                }
            };

            const resizeListener: any = function(): void {
                clearTimeout(throttler);
                throttler = setTimeout(setNavButtonsPosition, 250);
            };

            setNavButtonsPosition();

            /**
             * Register resize event if not registered before.
             */
            if (!this._lazyImageResizeEventHandlerAdded) {
                $(window).on('resize', resizeListener);
            }
        }
    }
}
