import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';
import csTeaser from 'components/teaser/teaser';
import ProportionalScaler from 'components/proportional-scaler/proportional-scaler';

/**
 * component's video handlers interface.
 * WARNING: Modal is not supported by this component. Most likely you have it alredy.
 *          This interface defines methods needed by ImageTeaser component to make videos work.
 */
interface ImageTeaserNextModalHandlers {
    /**
     * Handler of modal render.
     * Used to prepare modal if it's done via JS
     * @type {function}
     */
    renderModal?: Function;

    /**
     * Handler of modal behavior: opening.
     * @type {function}
     */
    openModal?: Function;

    /**
     * Handler of modal behavior: closing.
     * @type {function}
     */
    closeModal?: Function;
}

/**
 * component options interface.
 */
interface ImageTeaserNextOptions {
    /**
     * Classname of image teaser
     * Default: 'cs-image-teaser'
     * @type {string}
     */
    teaserName?: string;

    /**
     * Classname of video modal
     * Default: 'cs-image-teaser__modal'
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
    modalHandlers?: ImageTeaserNextModalHandlers;
}

export default class ImageTeaserNext {
    public _options: ImageTeaserNextOptions;
    public _ytModal: any;
    public _ytPlayer: any;
    protected _$container: JQuery;
    protected _swiperDefaults: object;
    protected _optionsOverrides: any;
    protected _instance: any;
    protected _$videosTriggers: JQuery;

    /**
     * Creates new ImageTeaser component with optional settings.
     * @param  {ImageTeaser} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: ImageTeaserNextOptions) {
        const defaultOptions: any = {
            teaserName: 'cs-image-teaser-next',
            allowVideos: true,
            videoModalClass: 'cs-image-teaser-next__modal',
            videoAutoplay: true,
            videoModalSelector: '#yt-modal',
            videoPlayerId: 'yt-player',
            videoPlayerWidth: '1200',
            videoPlayerHeight: '675',
            openVideoInFullscreenMobile: true,
            modalHandlers: {
                renderModal: (ImageTeaser: ImageTeaserNext) => false,
                openModal: (ImageTeaser: ImageTeaserNext) => false,
                closeModal: (ImageTeaser: ImageTeaserNext) => false,
            },
        };

        this._options = $.extend(defaultOptions, options);
        this._$container = $element;

        const maxMobileWidth: number = breakpoint.tablet - 1;
        this._swiperDefaults = {
            spaceBetween: 8,
            slidesPerView:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            slidesPerGroup:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            isSlider: Boolean(this._$container.data('is-slider')) || false,
            isSliderMobile:
                Boolean(this._$container.data('mobile-is-slider')) || false,
            carouselBreakpoint: breakpoint.tablet,
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
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingOnTransitionStart: true,
        };

        this._options = $.extend(this._swiperDefaults, this._options);
        this._optionsOverrides = this._getDataAttrOverrideOptions();
        if (this._optionsOverrides) {
            this._options = $.extend(this._options, this._optionsOverrides);
        }

        if (this._options.isSlider) {
            this._initTeaser(this._$container);
        }

        if (this._options.isSliderMobile && !this._options.isSlider) {
            const _this: any = this;

            this._toggleMobileTeaser();

            $(window).on('resize', function(): void {
                _this._toggleMobileTeaser();
            });
        }

        if (this._options.allowVideos) {
            this._$videosTriggers = $(
                `.${this._options.teaserName} a[href*="youtube.com"]`
            );
            if (this._$videosTriggers.length) {
                if (!this._isYTapiLoaded()) {
                    this._loadYTapi();
                    this.renderModal();
                }
            }
        }

        this._initializeProportionalSlideScaling();
    }

    public getInstance(): any {
        return this._instance;
    }

    /**
     * Setups modal component and initialize it
     * (shall be delivered from the outside component)
     */
    public renderModal(): any {
        if (
            this._options.modalHandlers.renderModal &&
            typeof this._options.modalHandlers.renderModal === 'function'
        ) {
            this._options.modalHandlers.renderModal(this);
        }
    }

    /**
     * Event handler for opening modal
     * (shall be delivered from the outside component)
     */
    public openModal(): any {
        if (
            this._options.modalHandlers.openModal &&
            typeof this._options.modalHandlers.openModal === 'function'
        ) {
            this._options.modalHandlers.openModal(this);
        }
    }

    /**
     * Event handler for closing modal
     * (shall be delivered from the outside component)
     */
    public closeModal(): any {
        if (
            this._options.modalHandlers.closeModal &&
            typeof this._options.modalHandlers.closeModal === 'function'
        ) {
            this._options.modalHandlers.closeModal(this);
        }
    }

    /**
     * Tells if video shall be opened in fullscreen mode based on browser information
     * It returns true for all TOUCH devices, not only Smartphones and Tablets
     * @return Boolean
     */
    public shallOpenVideoInFullscreen(): boolean {
        return (
            this._options.openVideoInFullscreenMobile &&
            ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
        );
    }

    protected _getDataAttrOverrideOptions(): any {
        let result: any;
        const dataAttrCfg: any = this._$container.data('js-configuration');

        if (dataAttrCfg) {
            try {
                result = JSON.parse(JSON.stringify(dataAttrCfg));
            } catch (err) {
                console.warn(`Could not parse settings from data-attribute: ${err}`);
            };
        }

        return result;
    }

    /**
     * Initializes teaser
     */
    protected _initTeaser($element: JQuery): void {
        this._instance = new csTeaser($element, this._options);
    }

    /**
     * Initializes teaser only for mobiles
     */
    protected _toggleMobileTeaser(): void {
        if ($(window).width() < this._options.carouselBreakpoint) {
            if (!this._instance) {
                this._$container.addClass(
                    `${this._options.teaserName}--slider`
                );
                this._initTeaser(this._$container);
            }
        } else {
            if (this._instance) {
                this._instance.destroy();
                this._$container
                    .removeClass(`${this._options.teaserName}--slider`)
                    .find(`.${this._options.teaserName}__slides`)
                    .removeAttr('style')
                    .find(`.${this._options.teaserName}__slide`)
                    .removeAttr('style');
                this._instance = undefined;
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
            _obj._ytPlayer = new YT.Player(_obj._options.videoPlayerId, {
                width: _obj._options.videoPlayerWidth,
                height: _obj._options.videoPlayerHeight,
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

    protected _initializeProportionalSlideScaling(): void {
        this._$container.find(`.${this._options.teaserName}__slide`).each(function(): void {
            new ProportionalScaler($(this));
        });
    }
}
