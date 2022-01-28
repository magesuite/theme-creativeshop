import ISliderAutorotation from './interface';

/**
 * Following Baymard report we do not apply autorotate on touch devices,
 * Applied desktop autorotate will be paused on mouseenter and resumed after mouseleave. Interaction disables autorotate at all until next visit.
 * More about it here: https://baymard.com/blog/homepage-carousel
 */

export default class SliderAutorotation {
    public options: ISliderAutorotation = {
        itemsPerView: 1,
        collectionSize: 1,
    };
    public currentSlideIndex: number;
    protected _navigation: any;
    protected _rotator: ReturnType<typeof setInterval>;
    protected _isTouch: MediaQueryList = window.matchMedia('(hover: none)');
    protected boundMouseenterHandler: any;
    protected boundMouseleaveHandler: any;

    /**
     * Creates new Slider Navigation component with given settings.
     * @param {ISliderPagination} options - component settings object.
     */
    public constructor(options: ISliderAutorotation) {
        this.options = { ...this.options, ...options };
        this._navigation = this.options.navInstance;

        if (!this._navigation) {
            return;
        }

        this.currentSlideIndex = 1;

        if (!this._isTouch?.matches) {
            this._startAutorotate();
        }
        this._attachEvents();
    }

    /**
     * Instrues navigation instance to switch slide to the next one (as long as root component instance wasn't interacted manually) and updates current index to know to which slide to scroll next upon next call
     */
    protected _scrollToNext(): void {
        if (
            this._navigation != null &&
            this._navigation.interacted &&
            this._rotator != null
        ) {
            this._stopAutorotate();
            return;
        }

        let nextIndex = this.currentSlideIndex + this.options.itemsPerView;

        if (nextIndex === this.options.collectionSize) {
            nextIndex =
                this.options.collectionSize - this.options.itemsPerView + 1;
        } else if (nextIndex > this.options.collectionSize) {
            nextIndex = 1;
        }

        this._navigation.scrollToSlide(nextIndex);
        this.currentSlideIndex = nextIndex;
    }

    /**
     * Stops autorotate interval (caused on mouseenter as long as root component wasn't interacted manually)
     */
    protected _stopAutorotate(): void {
        clearInterval(this._rotator);
        this._rotator = null;

        if (this._navigation.interacted) {
            this._detachEvents();
        }
    }

    /**
     * Starts autorotate interval (caused on mouseleave as long as root component wasn't interacted manually)
     */
    protected _startAutorotate(): void {
        if (!this._navigation?.interacted) {
            this._rotator = setInterval(
                (): void => this._scrollToNext(),
                this.options.delay
            );
        }
    }

    protected _detachEvents(): void {
        this.options.pauseNode?.removeEventListener(
            'mouseenter',
            this.boundMouseenterHandler
        );
        this.options.pauseNode?.removeEventListener(
            'mouseleave',
            this.boundMouseleaveHandler
        );
    }

    /**
     * Initializes mouseenter and mouseleave events for controlling autorotate
     */
    protected _attachEvents(): void {
        if (
            this.options.pauseNode &&
            !this._isTouch?.matches &&
            !this._navigation.interacted
        ) {
            this.boundMouseenterHandler = this._stopAutorotate.bind(this);
            this.boundMouseleaveHandler = this._startAutorotate.bind(this);
            this.options.pauseNode?.addEventListener(
                'mouseenter',
                this.boundMouseenterHandler
            );
            this.options.pauseNode?.addEventListener(
                'mouseleave',
                this.boundMouseleaveHandler
            );
        }

        this._isTouch.addEventListener(
            'change',
            (): void => {
                if (this._isTouch?.matches && this._rotator != null) {
                    this._stopAutorotate();
                } else if (!this._isTouch?.matches && this._rotator == null) {
                    this._startAutorotate();
                }
            },
            false
        );

        document.addEventListener(
            'visibilitychange',
            (): void => {
                if (!this._isTouch?.matches) {
                    if (document.visibilityState === 'hidden') {
                        this._stopAutorotate();
                    } else {
                        this._startAutorotate();
                    }
                }
            },
            false
        );
    }
}
