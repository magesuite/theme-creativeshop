import ISliderNavigation from './interface';

export default class SliderNavigation {
    public options: ISliderNavigation = {
        itemsPerView: 1,
        scrollableElementSelector: '.cs-image-teaser__slides',
        slideSelector: '.cs-image-teaser__slide',
        prevButtonSelector: '.cs-slider-navigation--prev',
        nextButtonSelector: '.cs-slider-navigation--next',
    };
    public currentIndex: number = 1;
    public interacted: boolean = false;
    protected _isInitialized: boolean = false;
    protected _scrollable: HTMLElement;
    protected _slides: NodeListOf<HTMLElement>;
    protected _prevTrigger: HTMLButtonElement;
    protected _nextTrigger: HTMLButtonElement;
    protected _scrollBehaviorPreference: 'auto' | 'smooth';

    /**
     * Creates new Slider Navigation component with given settings.
     * @param {ISliderPagination} options - component settings object.
     */
    public constructor(options: ISliderNavigation) {
        this.options = { ...this.options, ...options };

        this._scrollable = this.options.rootComponentNode.querySelector(
            this.options.scrollableElementSelector
        );
        this._slides = this.options.rootComponentNode.querySelectorAll(
            this.options.slideSelector
        );
        this._prevTrigger = this.options.rootComponentNode.querySelector(
            this.options.prevButtonSelector
        );
        this._nextTrigger = this.options.rootComponentNode.querySelector(
            this.options.nextButtonSelector
        );

        this._scrollBehaviorPreference = window.matchMedia(
            '(prefers-reduced-motion: no-preference)'
        ).matches
            ? 'smooth'
            : 'auto';

        if (this._prevTrigger && this._nextTrigger) {
            this.init();
        }
    }

    public init(): void {
        this._togglePrevButtonLock();
        this._attachEvents();
        this._observeLastItem();
        this._toggleVisibility();

        this._isInitialized = true;
    }

    /**
     * Scrolls carousel to calculated slide.
     * If 'useWholeScreen' option is enabled, it takes scroll-padding into account to scroll to the edge of the component, not the edge of the screen
     * @param newIndex {number} New slide index to scroll to
     * @param behavior {string} ScrollBehavior preference
     */
    public scrollToSlide(
        newIndex: number,
        behavior: ScrollBehavior = this._scrollBehaviorPreference
    ): void {
        let computedScrollPadding: number = 0;

        if (this.options.useWholeScreen) {
            computedScrollPadding = +getComputedStyle(this._scrollable)
                .scrollPaddingInline;

            if (isNaN(computedScrollPadding)) {
                computedScrollPadding = this._slides[
                    this.currentIndex - 1
                ].getBoundingClientRect().left;
            }
        }

        this._scrollable.scrollTo({
            left:
                this._slides[newIndex - 1].offsetLeft -
                (!isNaN(computedScrollPadding) ? computedScrollPadding : 0),
            behavior: behavior,
        });

        this._togglePrevButtonLock();
    }

    /**
     * Exposes method for parent component to update itemsPerView whenever it's needed (f.e. breakpoint changes)
     * @param itemsPerView {number} new itemx per view value
     */
    public setItemsPerView(itemsPerView: number): void {
        this.options.itemsPerView = itemsPerView;
    }

    /**
     * Exposes method for parent component to update current index whenever it's needed (when intersection observer catches changes)
     * @param entry {IntersectionObserverEntry} changed IO entry
     */
    public handleIntersect(entry: IntersectionObserverEntry): void {
        this.currentIndex = Math.ceil(
            Array.prototype.indexOf.call(this._slides, entry.target) + 1
        );

        this._togglePrevButtonLock();
        this._toggleVisibility();
    }

    /**
     * Disables/enables prev/next button
     */
    protected _togglePrevButtonLock(): void {
        this._prevTrigger.disabled = this.currentIndex <= 1;
    }

    /**
     * Toggles visibility of prev/next buttons (both at the same time) when current items-pre-view equals or is higher than amount of slides
     */
    protected _toggleVisibility(): void {
        if (this.options.itemsPerView >= this._slides.length) {
            this._prevTrigger.style.display = 'none';
            this._nextTrigger.style.display = 'none';
        } else {
            this._prevTrigger.style.display = '';
            this._nextTrigger.style.display = '';
        }
    }

    /**
     * Configures scrollToSlide() method to pass new index and handle scroll once clicked <prev> button
     */
    protected _handleSlideToPrev(): void {
        this.scrollToSlide(
            this.currentIndex - this.options.itemsPerView > 0
                ? this.currentIndex - this.options.itemsPerView
                : 1
        );
        this.interacted = true;
    }

    /**
     * Configures scrollToSlide() method to pass new index and handle scroll once clicked <next> button
     */
    protected _handleSlideToNext(): void {
        this.scrollToSlide(
            this.currentIndex + this.options.itemsPerView <
                this.options.collectionSize
                ? this.currentIndex + this.options.itemsPerView
                : this.options.collectionSize
        );
        this.interacted = true;
    }

    /**
     * Defines and distributes events across component's instance
     */
    protected _attachEvents(): void {
        this._prevTrigger?.addEventListener(
            'click',
            (): void => this._handleSlideToPrev(),
            { passive: true }
        );

        this._nextTrigger?.addEventListener(
            'click',
            (): void => this._handleSlideToNext(),
            { passive: true }
        );
    }

    /**
     * Observes last slide item to disable/enable "next" button
     */
    protected _observeLastItem(): void {
        const observer: IntersectionObserver = new IntersectionObserver(
            entries =>
                entries.forEach((entry: IntersectionObserverEntry) => {
                    this._nextTrigger.disabled = entry.isIntersecting;
                    this._toggleVisibility();
                }),
            {
                root: this._scrollable as HTMLElement,
                threshold: 0.5,
            }
        );

        observer.observe(this._slides[this._slides.length - 1]);
    }
}
