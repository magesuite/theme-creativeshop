import * as $ from 'jquery';

import csTeaser from 'components/teaser/teaser';
import ProportionalScaler from 'components/proportional-scaler/proportional-scaler';
import VideoPlayer from 'components/video-player/video-player';

/**
 * component options interface.
 */
interface ImageTeaserOptions {
    /**
     * Classname of image teaser
     * Default: 'cs-image-teaser'
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

    /**
     * Tells if videos shall be handled
     * @type {boolean}
     * @default true
     */
    allowVideos?: boolean;

    /**
     * Defines breakpoint, where carousel should be destroyed and teaser shall display as standard image teaser
     * Default: breakpoint.tablet
     * @type {number | string}
     */
    carouselBreakpoint?: number | string;

    /**
     * Defines carousel behaviour depending on given fallback
     * Default: {
     *     breakpoint.tablet - 1
     * }
     * @type {Object}
     */
    breakpoints?: any;

    /**
     * Defines if ProportionalScaler shall be initialized.
     * @type {boolean}
     */
    scaleFontsDynamically?: boolean;
}

export default class ImageTeaser {
    public _options: ImageTeaserOptions;
    public _videoPlayer: any;
    protected _$container: JQuery;
    protected _swiperDefaults: object;
    protected _optionsOverrides: any;
    protected _instance: any;
    protected _$videosTriggers: JQuery;
    protected _isTeaserInitialised: any = false;

    /**
     * Creates new ImageTeaser component with optional settings.
     * @param  {ImageTeaser} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: ImageTeaserOptions) {
        const defaultOptions: any = {
            teaserName: 'cs-image-teaser',
            allowVideos: true,
            videoModalClass: 'cs-image-teaser__modal',
            scaleFontsDynamically: true,
        };

        this._options = $.extend(defaultOptions, options);
        this._$container = $element;

        const maxMobileWidth: number = breakpoint.tablet - 1;
        this._swiperDefaults = {
            spaceBetween: 0,
            slidesPerView:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            slidesPerGroup:
                parseInt(this._$container.data('items-per-view'), 10) || 1,
            isSlider: Boolean(this._$container.data('is-slider')) || false,
            isSliderMobile:
                Boolean(this._$container.data('mobile-is-slider')) || false,
            carouselBreakpoint: breakpoint.tablet,
            loop:
                parseInt(this._$container.data('items-per-view'), 10) >=
                this._$container.find(`.${this._options.teaserName}__slide`)
                    .length
                    ? false
                    : true,
            centeredSlides: false,
            calculateSlides: false,
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
                paginationRender: function() {
                    const pagination = this.pagination;
                    $(pagination.el).toggle(pagination.bullets.length > 1);
                },
            },
        };

        this._options = $.extend(this._swiperDefaults, this._options);
        this._optionsOverrides = this._getDataAttrOverrideOptions();
        if (this._optionsOverrides) {
            this._options = $.extend(this._options, this._optionsOverrides);
        }

        if (this._options.isSlider) {
            if (
                this._options.isSliderMobile ||
                $(window).width() >=
                    parseInt(this._options.carouselBreakpoint, 10)
            ) {
                this._initTeaser(this._$container);
                this._isTeaserInitialised = true;
            }
        }

        this._toggleTeaser();
        $(window).on('resize', (): void => {
            this._toggleTeaser();
        });

        if (this._options.allowVideos) {
            this._videoPlayer = new VideoPlayer();
        }

        if (this._options.scaleFontsDynamically) {
            this._initializeProportionalSlideScaling();
        } else {
            this._onImageReady();
        }
    }

    public getInstance(): any {
        return this._instance;
    }

    protected _getDataAttrOverrideOptions(): any {
        let result: any;
        const dataAttrCfg: any = this._$container.data('js-configuration');

        if (dataAttrCfg) {
            try {
                result = JSON.parse(JSON.stringify(dataAttrCfg));
            } catch (err) {
                /* tslint:disable */
                console.warn(
                    `Could not parse settings from data-attribute: ${err}`
                );
                /* tslint:enable */
            }
        }

        return result;
    }

    /**
     * Initializes teaser
     */
    protected _initTeaser($element: JQuery): void {
        this._isTeaserInitialised = true;
        this._instance = new csTeaser($element, this._options);
    }

    /**
     * Destroys teaser
     */
    protected _destroyTeaser(): void {
        this._isTeaserInitialised = false;
        this._instance.destroy();
        this._instance = undefined;
    }

    /**
     * Manipulates teaser's classes and style attributes
     */
    protected _toggleTeaserClasses(): void {
        if (this._isTeaserInitialised) {
            this._$container
                .removeClass(`${this._options.teaserName}--slider`)
                .find(`.${this._options.teaserName}__slides`)
                .removeAttr('style')
                .find(`.${this._options.teaserName}__slide`)
                .removeAttr('style');
        } else if (!this._isTeaserInitialised) {
            this._$container.addClass(`${this._options.teaserName}--slider`);
        }
    }

    /**
     * Manipulates the teaser depending on slider setting (mobile or desktop)
     * and current window width.
     */
    protected _toggleTeaser(): void {
        const isSliderMobileOnly =
            this._options.isSliderMobile && !this._options.isSlider;
        const isSliderDesktopOnly =
            !this._options.isSliderMobile && this._options.isSlider;
        const isWindowMobile =
            $(window).width() < parseInt(this._options.carouselBreakpoint, 10);

        if (isSliderMobileOnly) {
            if (isWindowMobile) {
                if (!this._instance) {
                    this._toggleTeaserClasses();
                    this._initTeaser(this._$container);
                }
            } else {
                if (this._instance) {
                    this._toggleTeaserClasses();
                    this._instance.destroy();
                }
            }
        }
        if (isSliderDesktopOnly) {
            if (isWindowMobile) {
                if (this._instance) {
                    this._toggleTeaserClasses();
                    this._instance.destroy();
                }
            } else {
                if (!this._instance) {
                    this._toggleTeaserClasses();
                    this._initTeaser(this._$container);
                }
            }
        }
    }

    protected _initializeProportionalSlideScaling(): void {
        const $container = this._$container;

        this._$container
            .find(`.${this._options.teaserName}__slide`)
            .each(function(): void {
                const $slide: JQuery<HTMLElement> = $(this);

                const textScaler = new ProportionalScaler($slide, {
                    scalableElementSelector: '.cs-image-teaser__text-content',
                });

                const badgeScaler = new ProportionalScaler($slide, {
                    scalableElementSelector: '.cs-image-teaser__badge',
                });

                $.when(
                    textScaler._initScaling(),
                    badgeScaler._initScaling()
                ).done(() => {
                    $slide.addClass('ready');

                    $container.on('teaserUpdated', () =>
                        setTimeout(() => {
                            textScaler._scale();
                            badgeScaler._scale();
                        })
                    );
                });
            });
    }

    protected _onImageReady(): void {
        this._$container
            .find(`.${this._options.teaserName}__slide`)
            .each(function(): void {
                const $slide: JQuery<HTMLElement> = $(this);

                if ($slide.hasClass('.lazyload')) {
                    $slide.on('lazyloaded', (): void => {
                        $slide.addClass('ready');
                    });
                } else {
                    $slide.addClass('ready');
                }
            });
    }
}
