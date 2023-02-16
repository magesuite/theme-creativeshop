import * as $ from 'jquery';
import { default as idleDeferred } from 'utils/idle-deffered';
import VideoTeaser from 'components/video-teaser/video-teaser';

declare global {
    interface Window {
        __smoothScrollPolyfilled: boolean;
    }
}

/**
 * Interface for gallery images params
 */
export interface IGalleryImageParams {
    imageMimeType: string;
    imageWidth: number;
    imageHeight: number;
    imageFullWidth: number;
    imageFullHeight: number;
    imageSmallWidth: number;
    imageSmallHeight: number;
    initialGalleryImages: any[];
    videoUrl: string;
}

/**
 * SlideGallery component options interface.
 */
export interface SlideGalleryOptions {
    viewXmlConfigPath?: string;
    zoom3Steps?: boolean;
    selectors?: any;
    classNames?: any;
    componentClass?: string;
    scrollableElementSelector?: string;
    listElementSelector?: string;
    navSelector?: string;
    prevButtonSelector?: string;
    nextButtonSelector?: string;
    zoomButtonSelector?: string;
    unzoomButtonSelector?: string;
    closeButtonSelector?: string;
    slideSelector?: string;
    slideActiveClass?: string;
    thumbSelector?: string;
    thumbActiveClass?: string;
    imageSelector?: string;
    zoomImageSelector?: string;
    videoSlideSelector?: string;
    observerOptions?: IntersectionObserverInit;
    observeElementSelector?: string;
    scrollToFirstImageOnUpdate?: boolean;
    imageParams?: IGalleryImageParams;
    paginationElementSelector?: string;
    loaderSelector?: string;
    galleryAutoScrollClass?: string;
    galleryLoadingClass?: string;
    galleryZoomClass?: string;
    galleryZoomVisibleClass?: string;
    slideImageSelector?: string;
    galleryFullscreenClass?: string;
    galleryFullscreenVisibleClass?: string;
    galleryFullscreenImagesClass?: string;
}

/**
 * SlideGallery component.
 */
export default class SlideGallery {
    protected currentIndex: number = 0;
    protected _fullscreenVisible: boolean = false;
    protected _zoomVisible: boolean = false;
    protected _$component: JQuery;
    protected _scrollable: HTMLElement;
    protected _$prevButton: JQuery;
    protected _$nextButton: JQuery;
    protected _$zoomButton: JQuery;
    protected _$unzoomButton: JQuery;
    protected _$closeButton: JQuery;
    protected _$slides: JQuery;
    protected _$thumbs: JQuery;
    protected _$images: JQuery;
    protected _$zoomImages: JQuery;
    protected _$window: JQuery<Window> = $(window);
    protected _leftScroll: number = 0;
    protected _zoomStep: number = 0;
    protected _fullImagesLoaded: boolean = false;
    protected _$videoSlide: JQuery;
    protected _observer: IntersectionObserver;
    protected _currentImages: any[] = [];
    public videoSlideInstance;

    protected _options: SlideGalleryOptions = {
        viewXmlConfigPath: 'vars.MageSuite_ProductSlideGallery.video_slide',
        zoom3Steps: false,
        selectors: {
            scrollableElementSelector: '.cs-slide-gallery__slides',
            listElementSelector: '.cs-slide-gallery__slides',
            navSelector: '.cs-slide-gallery__nav',
            prevButtonSelector: '.cs-slide-gallery__nav--prev',
            nextButtonSelector: '.cs-slide-gallery__nav--next',
            zoomButtonSelector: '.cs-slide-gallery__zoom',
            unzoomButtonSelector: '.cs-slide-gallery__unzoom',
            closeButtonSelector: '.cs-slide-gallery__close',
            slideSelector: '.cs-slide-gallery__slide',
            slideImageSelector: '.cs-slide-gallery__img',
            thumbSelector: '.cs-slide-gallery__thumb',
            imageSelector: '.cs-slide-gallery__picture--base',
            zoomImageSelector: '.cs-slide-gallery__picture--full',
            videoSlideSelector: '.cs-slide-gallery__slide--video',
            paginationElementSelector: '.cs-slide-gallery__pagination',
            loaderSelector: '.load.indicator',
            observeElementSelector: '.cs-slide-gallery__slide',
        },
        classNames: {
            galleryAutoScrollClass: 'cs-slide-gallery--jump-scrolling',
            galleryLoadingClass: 'cs-slide-gallery--loading',
            galleryZoomClass: 'cs-slide-gallery--zoom',
            galleryZoomVisibleClass: 'slide-gallery-zoom-visible',
            galleryFullscreenClass: 'cs-slide-gallery--fullscreen',
            galleryFullscreenVisibleClass: 'slide-gallery-fullscreen-visible',
            galleryFullscreenImagesClass: 'cs-slide-gallery--fullimages',
            slideActiveClass: 'cs-slide-gallery__slide--active',
            thumbActiveClass: 'cs-slide-gallery__thumb--active',
        },
        observerOptions: {
            root: document.querySelector('.cs-slide-gallery__slides'),
            rootMargin: '0px',
            threshold: 0.75,
        },
        scrollToFirstImageOnUpdate: true,
    };

    /**
     * Slide gallery component constructor
     * @param  {IGalleryImageParams} options Image params
     */
    public constructor(
        element?: HTMLDivElement,
        options?: IGalleryImageParams
    ) {
        this._options = {
            ...this._options,
            imageParams: options,
        };
        this._$component = $(element);

        this.init();
    }

    /**
     * Initialize component
     */
    public init(): void {
        if (!('IntersectionObserver' in window) || !this._$component) {
            return;
        }

        this._smoothscrollPolyfill();
        this._assignControls();
        this._assignSlides();
        this._attachControlEvents();
        this._attachSlidesEvents();
        this._setActiveThumb(0);
        this._setObserver();

        this.videoSlideInstance = new VideoTeaser(
            this._options.viewXmlConfigPath
        );

        this._$component.addClass('loaded');
        this._$component.trigger('gallery:loaded');

        // Load base images when browser becomes idle.
        idleDeferred().then(() => this._loadAllBaseImages());
    }

    /**
     * Smooth Scroll feature polyfill.
     */
    protected _smoothscrollPolyfill(): void {
        if (
            !('scrollBehavior' in document.documentElement.style) &&
            !window.__smoothScrollPolyfilled
        ) {
            import('smoothscroll-polyfill').then((smoothscroll) => {
                if (
                    smoothscroll &&
                    typeof smoothscroll.polyfill === 'function'
                ) {
                    smoothscroll.polyfill();
                    window.__smoothScrollPolyfilled = true;
                }
            });
        }
    }

    /**
     * Assign controls to variables
     */
    protected _assignControls(): void {
        this._scrollable = this._$component.find(
            this._options.selectors.scrollableElementSelector
        )[0];

        // Buttons
        this._$prevButton = this._$component.find(
            this._options.selectors.prevButtonSelector
        );
        this._$nextButton = this._$component.find(
            this._options.selectors.nextButtonSelector
        );
        this._$zoomButton = this._$component.find(
            this._options.selectors.zoomButtonSelector
        );
        this._$unzoomButton = this._$component.find(
            this._options.selectors.unzoomButtonSelector
        );
        this._$closeButton = this._$component.find(
            this._options.selectors.closeButtonSelector
        );
    }

    /**
     * Assign slides to variables
     */
    protected _assignSlides(): void {
        // General slide elements
        this._$slides = this._$component
            .find(this._options.selectors.listElementSelector)
            .children(this._options.selectors.slideSelector);

        this._$thumbs = this._$component.find(
            this._options.selectors.thumbSelector
        );
        this._$images = this._$component.find(
            this._options.selectors.imageSelector
        );
        this._$zoomImages = this._$component.find(
            this._options.selectors.zoomImageSelector
        );

        // Video slide element
        this._$videoSlide = this._$component.find(
            this._options.selectors.videoSlideSelector
        );

        // Update images
        if (!this._currentImages.length) {
            this._currentImages =
                this._options.imageParams.initialGalleryImages;
        }
    }

    /**
     * Defines and distributes control events across component's instance
     */
    protected _attachControlEvents(): void {
        if (this._$prevButton.length) {
            this._$prevButton.on('click', (): void => {
                const currentIndex: number = this._getCurrentIndex();

                const activeIndex: number =
                    currentIndex - 1 > 0 ? currentIndex - 1 : 0;

                this.scrollToIndex(activeIndex);
            });
        }

        if (this._$nextButton.length) {
            this._$nextButton.on('click', (): void => {
                const currentIndex: number = this._getCurrentIndex();

                const activeIndex: number =
                    currentIndex + 1 < this._$slides.length
                        ? currentIndex + 1
                        : this._$slides.length - 1;

                this.scrollToIndex(activeIndex);
            });
        }

        if (this._$zoomButton.length) {
            this._$zoomButton.on('click', (e): void => {
                if (!this._fullscreenVisible) {
                    this._toggleFullscreen();
                } else {
                    this._zoom(null);
                }
            });
        }

        if (this._$unzoomButton.length) {
            this._$unzoomButton.on('click', (e): void => {
                this._unzoom();
            });
        }

        if (this._$closeButton.length) {
            this._$closeButton.on('click', (e): void => {
                if (this._zoomVisible) {
                    this._closeZoom(null);
                }
                this._toggleFullscreen();
            });
        }
    }

    /**
     * Defines and distributes slide events across component's instance
     */
    protected _attachSlidesEvents(): void {
        this._$component.on('updateImages', (event, data): void => {
            this.updateImages(data.images);
        });

        if (this._$thumbs.length) {
            this._$thumbs.each((index, thumb): void => {
                $(thumb).on('click', (): void => {
                    this.scrollToIndex(index);
                });
            });
        }

        if (this._$images.length) {
            this._$images.each((index, image): void => {
                $(image).on('click', (e): void => {
                    if (!this._fullscreenVisible) {
                        this._updateIndex(index);
                        this._toggleFullscreen();
                    }
                });
            });
        }

        if (this._$zoomImages.length) {
            this._$zoomImages.each((index, image): void => {
                $(image).on('click', (e): void => {
                    if (this._fullscreenVisible) {
                        if (
                            !this._zoomVisible ||
                            (this._zoomVisible && this._zoomStep < 3)
                        ) {
                            this._zoom(e);
                        }
                    }
                });
            });
        }
    }

    /**
     * Update images in slide gallery
     * @param images
     */
    protected updateImages(images): void {
        if (this._imagesAreEqual(images)) {
            return;
        }

        this._currentImages = images;

        this._toggleLoader(true);
        this._detachSlidesEvents();
        this._renderSlides().then(() => {
            this._assignSlides();
            this._attachSlidesEvents();
            this._setObserver();

            this.videoSlideInstance = new VideoTeaser(
                this._options.viewXmlConfigPath
            );

            if (this._options.scrollToFirstImageOnUpdate) {
                this.scrollToIndex(0);
            }

            this._$component.trigger('gallery:reloaded');
            this._toggleLoader(false);
        });
    }

    /**
     * Toggle loading spinner over slideGallery
     * @param value
     */
    protected _toggleLoader(value) {
        $(this._options.selectors.loaderSelector).toggle(value);
    }

    /**
     * Check if new images are equal to current images
     * @param images
     * @returns
     */
    protected _imagesAreEqual(images): boolean {
        return (
            images.length === this._currentImages.length &&
            images.every(
                (value, index) => value.img === this._currentImages[index].img
            )
        );
    }

    /**
     * Render new slides with current images
     */
    protected async _renderSlides() {
        const { default: requireAsync } = await import('utils/require-async');
        const { slideTemplate, thumbnailTemplate } = await import(
            './templates'
        );

        return requireAsync(['mage/template']).then(([mageTemplate]) => {
            const templateOptions = {
                images: this._currentImages,
                imageParams: this._options.imageParams,
            };
            const slideMarkup = mageTemplate(slideTemplate, templateOptions);
            const thumbnailMarkup = mageTemplate(
                thumbnailTemplate,
                templateOptions
            );

            $(this._options.selectors.listElementSelector).html(slideMarkup);
            $(this._options.selectors.paginationElementSelector).html(
                thumbnailMarkup
            );
        });
    }

    /**
     * Checks for slides with video content.
     */
    protected _isVideo(): boolean {
        return this._$videoSlide.length > 0;
    }

    /**
     * Updates active index value.
     */
    protected _updateIndex(activeIndex): void {
        this.currentIndex = activeIndex;
    }

    /**
     * Gets active index value
     */
    protected _getCurrentIndex(): number {
        return this.currentIndex;
    }

    /**
     * Sets `IntersectionObserver` with options defined in `_options` object
     * in order to observe slides intersecting with their container which
     * results in invoking observer's callback method `_onSlideChange`.
     */
    protected _setObserver(): void {
        const $slideElements: NodeListOf<Element> = document.querySelectorAll(
            this._options.selectors.observeElementSelector
        );

        this._observer = new IntersectionObserver(
            this._onSlideChange.bind(this),
            this._options.observerOptions
        );

        $slideElements.forEach((element) => {
            this._observer.observe(element);
        });
    }

    /**
     * IntersectionObserver callback method.
     * Handles multiple actions as updating current index, toggling nav buttons
     * visibility, setting active thumbnail and triggers `slide:changed` custom event.
     */
    protected _onSlideChange(entries): void {
        const slideActive: string = this._options.classNames.slideActiveClass;

        entries.forEach((entry) => {
            entry.target.classList.toggle(slideActive, entry.isIntersecting);

            if (entry.isIntersecting) {
                const activeElementIndex: number = $(entry.target).index();

                this._updateIndex(activeElementIndex);
                this._toggleNavButtons();

                if (window.innerWidth < breakpoint.tablet) {
                    this._setActiveThumb(activeElementIndex, true);
                }

                $(entry.target).trigger('slide:changed');
            }
        });
    }

    /**
     * Sets active thumb based on currentIndex value.
     * Transition timeout has been set in order to
     * avoid spaming thumbnail pagination elements with `thumbActiveClass`.
     */
    protected _setActiveThumb(
        activeIndex: number,
        transition: boolean = false
    ): void {
        this._$thumbs.removeClass(this._options.classNames.thumbActiveClass);

        if (transition) {
            let transitionTimeout: ReturnType<typeof setTimeout> = null;
            const transitionTimeoutDelay: number = 300;

            transitionTimeout = setTimeout((): void => {
                this._$thumbs
                    .eq(this._getCurrentIndex())
                    .addClass(this._options.classNames.thumbActiveClass);
            }, transitionTimeoutDelay);
        } else {
            this._$thumbs
                .eq(activeIndex)
                .addClass(this._options.classNames.thumbActiveClass);
        }
    }

    /**
     * Toggles the visibility of navigation buttons
     * based on current index.
     */
    protected _toggleNavButtons(): void {
        const activeIndex: number = this._getCurrentIndex();

        this._$prevButton.prop('disabled', activeIndex === 0);
        this._$nextButton.prop(
            'disabled',
            activeIndex + 1 > this._$slides.length - 1
        );
    }

    /**
     * Scrolls gallery to element based on given index value param.
     */
    public scrollToIndex(
        activeIndex: number,
        behavior: ScrollBehavior = 'smooth'
    ): void {
        if (behavior === 'auto') {
            this._$component.addClass(
                this._options.classNames.galleryAutoScrollClass
            );

            setTimeout((): void => {
                this._$component.removeClass(
                    this._options.classNames.galleryAutoScrollClass
                );
            }, 1000);
        }

        this._scrollable.scrollTo({
            left:
                this._$slides[activeIndex].offsetLeft -
                parseInt($(this._scrollable).css('padding-left'), 10),
            behavior: behavior,
        });

        if (window.innerWidth >= breakpoint.tablet) {
            this._setActiveThumb(activeIndex);
        }

        if (this._zoomVisible) {
            this._closeZoom(null); // Close zoom when transition to prev/next slide in fullScreen mode
        }
    }

    /**
     * Centers images during zoom in / zoom out in fullscreen mode.
     */
    protected _centerImage(
        e?: JQuery.Event,
        initialWidth?: number,
        initialHeight?: number
    ): void {
        let top: number;
        let left: number;

        const currentSlide: HTMLElement = this._$component.find(
            this._options.selectors.slideSelector
        )[this._getCurrentIndex()];

        const currentFullImg = this._$component.find(
            `${this._options.selectors.scrollableElementSelector} ${this._options.selectors.zoomImageSelector} ${this._options.selectors.slideImageSelector}`
        )[this._getCurrentIndex()] as HTMLImageElement;

        if (e) {
            const xRatio = e.offsetX / initialWidth;
            const yRatio = e.offsetY / initialHeight;

            left =
                currentFullImg.clientWidth * xRatio -
                window.innerWidth * xRatio;
            top =
                currentFullImg.clientHeight * yRatio -
                window.innerHeight * yRatio;
        }

        const centerImages = (e): void => {
            // Center current image if zoom was triggered by click/touch event
            this._$component.addClass(
                this._options.classNames.galleryAutoScrollClass
            );

            setTimeout((): void => {
                this._$component.removeClass(
                    this._options.classNames.galleryAutoScrollClass
                );
            }, 1000);

            if (e) {
                currentSlide.scrollTo({
                    top: top,
                    left: left,
                    behavior: 'auto',
                });
            } else {
                currentSlide.scrollTo({
                    top:
                        (currentFullImg.clientHeight -
                            currentSlide.clientHeight) /
                        2,
                    left:
                        (currentFullImg.clientWidth -
                            currentSlide.clientWidth) /
                        2,
                    behavior: 'auto',
                });
            }
        };

        if (currentFullImg.complete && currentFullImg.naturalHeight !== 0) {
            centerImages(e);
        } else {
            this._$component.addClass(
                this._options.classNames.galleryLoadingClass
            );
            centerImages(e);

            setTimeout((): void => {
                this._$component.removeClass(
                    this._options.classNames.galleryLoadingClass
                );
            }, 1000);
        }
    }

    /**
     * Loads images when browser becomes idle.
     */
    protected _loadAllBaseImages(): void {
        this._$slides
            .find(`${this._options.selectors.imageSelector} img`)
            .each((index, baseImage): void => {
                // First 2 images already have eager
                if (index > 1) {
                    $(baseImage).attr('loading', 'eager');
                }
            });
    }

    /**
     * Sets full size images.
     */
    protected _setFullImages(): void {
        this._$component.toggleClass(
            this._options.classNames.galleryFullscreenImagesClass
        );

        if (this._fullImagesLoaded) {
            return;
        }

        this._$slides
            .find(`${this._options.selectors.zoomImageSelector} img`)
            .each((index, fullImage): void => {
                $(fullImage).attr('src', $(fullImage).attr('data-src'));
            });
        this._fullImagesLoaded = true;
    }

    /**
     * Toggles between normal and full screen gallery mode.
     */
    protected _toggleFullscreen(): void {
        this._$component.toggleClass(
            this._options.classNames.galleryFullscreenClass
        );
        $('body, html').toggleClass(
            this._options.classNames.galleryFullscreenVisibleClass
        );

        this._setFullImages();
        this.scrollToIndex(this._getCurrentIndex(), 'auto');

        this._fullscreenVisible = !this._fullscreenVisible;
    }

    /**
     * Exits zoom mode.
     */
    protected _closeZoom(e: JQuery.Event): void {
        $('body, html').removeClass(
            this._options.classNames.galleryZoomVisibleClass
        );
        this._$component.removeClass(this._options.classNames.galleryZoomClass);

        if (this._options.zoom3Steps) {
            this._$component.removeClass(
                `${this._options.classNames.galleryZoomClass}-1 ${this._options.classNames.galleryZoomClass}-2 ${this._options.classNames.galleryZoomClass}-3`
            );
        }

        this._zoomVisible = false;
        this._zoomStep = 0;
    }

    /**
     * 3 step zoom mode.
     * Increase zoom value.
     * Slides with images only, suppressed on video slide.
     */
    protected _zoom(e: JQuery.Event): void {
        let currentPicture: HTMLElement = this._$component.find(
            this._options.selectors.imageSelector
        )[this._getCurrentIndex()];

        if (this._fullImagesLoaded) {
            currentPicture = this._$component.find(
                this._options.selectors.zoomImageSelector
            )[this._getCurrentIndex()];
        }

        if (!$(currentPicture).length) {
            return; // Exit zoom if on slide with video
        }

        const currentPictureWidth: number = currentPicture.clientWidth;
        const currentPictureHeight: number = currentPicture.clientHeight;

        $('body, html').addClass(
            this._options.classNames.galleryZoomVisibleClass
        );
        this._$component.addClass(this._options.classNames.galleryZoomClass);

        if (this._options.zoom3Steps && this._zoomStep < 3) {
            this._$component.removeClass(
                `${this._options.classNames.galleryZoomClass}-${this._zoomStep}`
            );
            this._zoomStep++;
            this._$component.addClass(
                `${this._options.classNames.galleryZoomClass}-${this._zoomStep}`
            );
        }

        this._centerImage(e, currentPictureWidth, currentPictureHeight);
        this._zoomVisible = true;
    }

    /**
     * 3 step zoom mode.
     * Decrease zoom value.
     */
    protected _unzoom(): void {
        if (this._options.zoom3Steps && this._zoomStep > 1) {
            this._$component.removeClass(
                `${this._options.classNames.galleryZoomClass}-${this._zoomStep}`
            );
            this._zoomStep--;
            this._$component.addClass(
                `${this._options.classNames.galleryZoomClass}-${this._zoomStep}`
            );
            this._centerImage(null);
        } else if (this._options.zoom3Steps && this._zoomStep === 1) {
            this._$component.removeClass(
                `${this._options.classNames.galleryZoomClass}-${this._zoomStep}`
            );
            this._zoomStep--;
            $('body, html').removeClass(
                this._options.classNames.galleryZoomVisibleClass
            );
            this._$component.removeClass(
                this._options.classNames.galleryZoomClass
            );
            this._zoomVisible = false;
        } else if (!this._options.zoom3Steps) {
            $('body, html').removeClass(
                this._options.classNames.galleryZoomVisibleClass
            );
            this._$component.removeClass(
                this._options.classNames.galleryZoomClass
            );
            this._zoomVisible = false;
        }
    }

    /**
     * Detach events applied within `_attachEvents` method.
     */
    protected _detachControlEvents(): void {
        if (this._$prevButton.length) {
            this._$prevButton.off();
        }

        if (this._$nextButton.length) {
            this._$nextButton.off();
        }

        if (this._$zoomButton.length) {
            this._$zoomButton.off();
        }

        if (this._$unzoomButton.length) {
            this._$unzoomButton.off();
        }

        if (this._$closeButton.length) {
            this._$closeButton.off();
        }
    }

    protected _detachSlidesEvents(): void {
        this._$component.off('updateImages');

        if (this._$thumbs.length) {
            this._$thumbs.each((index, thumb): void => {
                $(thumb).off('click');
            });
        }

        if (this._$images.length) {
            this._$images.each((index, image): void => {
                $(image).off('click');
            });
        }

        if (this._isVideo()) {
            $(this._options.selectors.slideSelector).off('slide:changed');
        }
    }
}