import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';

/**
 * component's video handlers interface.
 * WARNING: Modal is not supported by this component. Most likely you have it alredy.
 *          This interface defines methods needed by ImageTeaserLegacy component to make videos work.
 */
interface ImageTeaserLegacyModalHandlers {
    /**
     * Handler of modal render.
     * Used to prepare modal if it's done via JS
     */
    renderModal?: (ImageTeaserLegacy: ImageTeaserLegacy) => any;

    /**
     * Handler of modal behavior: opening.
     */
    openModal?: (ImageTeaserLegacy: ImageTeaserLegacy) => any;

    /**
     * Handler of modal behavior: closing.
     */
    closeModal?: (ImageTeaserLegacy: ImageTeaserLegacy) => any;
}

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
     * Classname of video modal
     * Default: 'cs-image-teaser-legacy__modal'
     * @type {string}
     */
    videoModalClass?: string;

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
     * tells if video should be played automaticaly right after opening
     * @type {boolean}
     * @default true
     */
    videoAutoplay?: boolean;

    /**
     * Video Modal selector
     * @type {string}
     * @default '#yt-modal'
     */
    videoModalSelector?: string;

    /**
     * Html ID of Video Player
     * @type {string}
     * @default 'yt-player'
     */
    videoPlayerId?: string;

    /**
     * Html ID of Video Player for mobile devices
     * It is separate element because it shall not be in modal
     * @type {string}
     * @default 'yt-player-mobile'
     */
    videoMobilePlayerId?: string;

    /**
     * Width of the video player (in px, as string)
     * @type {string}
     * @default '1200'
     */
    videoPlayerWidth?: string;

    /**
     * Height of the video player (in px, as string)
     * @type {string}
     * @default '675'
     */
    videoPlayerHeight?: string;

    /**
     * Tells if video should be opened in fullscreen mode for mobile devices AND all other touch devices
     * @type {boolean}
     * @default true
     */
    openVideoInFullscreenMobile?: string;

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

    /**
     * Set of methods to handle modal behavior.
     * @type {Object}
     */
    modalHandlers?: ImageTeaserLegacyModalHandlers;
}

export default class ImageTeaserLegacy {
    public _ytModal: any;
    public _ytPlayer: any;
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
            videoAutoplay: true,
            videoModalSelector: '#yt-modal',
            videoPlayerId: 'yt-player',
            videoPlayerWidth: '1200',
            videoPlayerHeight: '675',
            openVideoInFullscreenMobile: true,
            modalHandlers: {
                renderModal: (ImageTeaserLegacy: ImageTeaserLegacy) => false,
                openModal: (ImageTeaserLegacy: ImageTeaserLegacy) => false,
                closeModal: (ImageTeaserLegacy: ImageTeaserLegacy) => false,
            },
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
            this._$videosTriggers = $(
                `.${this._settings.teaserName} a[href*="youtube.com"]`
            );
            if (this._$videosTriggers.length) {
                if (!this._isYTapiLoaded()) {
                    this._loadYTapi();
                    this.renderModal();
                }
            }
        }
    }

    public getInstance(): any {
        return this._teaserInstance;
    }

    /**
     * Setups modal component and initialize it
     * (shall be delivered from the outside component)
     */
    public renderModal(): any {
        if (
            this._settings.modalHandlers.renderModal &&
            typeof this._settings.modalHandlers.renderModal === 'function'
        ) {
            this._settings.modalHandlers.renderModal(this);
        }
    }

    /**
     * Event handler for opening modal
     * (shall be delivered from the outside component)
     */
    public openModal(): any {
        if (
            this._settings.modalHandlers.openModal &&
            typeof this._settings.modalHandlers.openModal === 'function'
        ) {
            this._settings.modalHandlers.openModal(this);
        }
    }

    /**
     * Event handler for closing modal
     * (shall be delivered from the outside component)
     */
    public closeModal(): any {
        if (
            this._settings.modalHandlers.closeModal &&
            typeof this._settings.modalHandlers.closeModal === 'function'
        ) {
            this._settings.modalHandlers.closeModal(this);
        }
    }

    /**
     * Tells if video shall be opened in fullscreen mode based on browser information
     * It returns true for all TOUCH devices, not only Smartphones and Tablets
     * @return Boolean
     */
    public shallOpenVideoInFullscreen(): boolean {
        return (
            this._settings.openVideoInFullscreenMobile &&
            ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
        );
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
            let throttler: number;
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

    /**
     * Setups click events for videos (if url matches youtube link)
     */
    protected _setVideoEvents(): void {
        const _obj: any = this;

        this._$videosTriggers.on('click', function(e: Event): void {
            e.preventDefault();
            const videoId: string = _obj._extractYTvideoId(
                $(this).attr('href')
            );

            _obj._runYTvideo(videoId);
        });
    }

    /**
     * Stips url to extract ID of the video
     */
    protected _extractYTvideoId(YTvideoUrl: string): string {
        const url: any = YTvideoUrl.split(
            /(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/
        );
        return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    }

    /**
     * Checks if API script has been already added to the DOM
     */
    protected _isYTapiLoaded(): boolean {
        return (
            $('head').find('script[src*="https://www.youtube.com/iframe_api"]')
                .length > 0
        );
    }

    /**
     * Loads youtube's Iframe API and then initializes player object
     * onYouTubeIframeAPIReady() has to be accessible globaly
     */
    protected _loadYTapi(): void {
        const _obj: any = this;
        const onYTplayerReady: any = this._setVideoEvents.bind(this);

        const tag: any = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag: any = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        function onYouTubeIframeAPIReady(): void {
            _obj._ytPlayer = new YT.Player(_obj._settings.videoPlayerId, {
                width: _obj._settings.videoPlayerWidth,
                height: _obj._settings.videoPlayerHeight,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                },
                events: {
                    onReady: onYTplayerReady,
                },
            });
        }

        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady.bind(this);
    }

    /**
     * Loads video with given ID into player and opens modal
     */
    protected _runYTvideo(videoId: string): void {
        this._ytPlayer.loadVideoById(videoId);
        this.openModal();
    }
}
