import ISliderPagination from './interface';

declare global {
    interface Window {
        breakpoint: any;
    }
}

export default class SliderPagination {
    public options: ISliderPagination = {
        fractionBreakpoint: 10,
        fractionTemplate:
            '<span class="current">%currentSlide</span> / %allSlides',
        slidesWrapperSelector: '.cs-image-teaser__slides',
        slideSelector: '.cs-image-teaser__slide',
    };
    public bulletsCount: number;
    public currentBulletIndex: number;
    public newBulletIndex: number;
    public isFraction: boolean;
    protected _paginationWrapper: HTMLElement;
    protected _bullets: NodeListOf<HTMLElement>;
    protected _slides: NodeListOf<HTMLElement>;

    /**
     * Creates new Slider Pagination component with given settings.
     * @param {ISliderPagination} options - component settings object.
     */
    public constructor(options: ISliderPagination) {
        this.options = { ...this.options, ...options };

        this._paginationWrapper = this.options.rootComponentNode.querySelector(
            '.cs-slider-pagination'
        );
        this._slides = this.options.rootComponentNode.querySelectorAll(
            this.options.slideSelector
        );

        if (this._paginationWrapper) {
            this._renderOutput();
        }
    }

    /**
     * Updates state of the component. Deselectes all bullets and selects current on, or, in case of fraction pagination - replaces old current index with the new one
     * @param newIndex new index of the bullet
     */
    public update(newIndex?: number): void {
        if (newIndex != null) {
            this.newBulletIndex = newIndex;
        }

        if (this.isFraction) {
            this._updateFractionHtml();
        } else {
            if (this._bullets == null) {
                this.rebuild();
            } else {
                this._bullets.forEach(bullet =>
                    bullet?.classList.remove('current')
                );
                this._bullets
                    .item(this.newBulletIndex)
                    ?.classList.add('current');
            }
        }

        this.currentBulletIndex = this.newBulletIndex;
    }

    /**
     * Rebuilds whole component
     */
    public rebuild(): void {
        this._renderOutput();
    }

    /**
     * Exposes method for parent component to update component's data when breakpoint changes
     */
    public setItemsPerView(itemsPerView: number): void {
        this.options.itemsPerView = itemsPerView;
        this.currentBulletIndex = 0;
        this.rebuild();
    }

    /**
     * Exposes method for parent component to update component's data when intersection observer provides changes (in other words: when current slide index changes)
     */
    public handleIntersect(entry: IntersectionObserverEntry): void {
        const newBulletIndex: number = Math.ceil(
            Array.prototype.indexOf.call(this._slides, entry.target) /
                this.options.itemsPerView
        );

        if (newBulletIndex < this.bulletsCount) {
            this.update(newBulletIndex);
        }
    }

    /**
     * Updates fraction pagination if available for the instance
     */
    protected _updateFractionHtml(): void {
        this._paginationWrapper.innerHTML = this.options.fractionTemplate
            .replace('%currentSlide', `${this.newBulletIndex + 1}`)
            .replace('%allSlides', `${this.bulletsCount}`);
    }

    /**
     * Builds component's DOM
     */
    protected _renderOutput(): void {
        this.bulletsCount = Math.ceil(
            this.options.collectionSize / this.options.itemsPerView
        );
        this.isFraction = this.bulletsCount >= this.options.fractionBreakpoint;
        this._setIndexes();

        if (this.isFraction) {
            this.currentBulletIndex = 0;
            this._paginationWrapper.classList.add(
                'cs-slider-pagination--fraction'
            );
            this._updateFractionHtml();
        } else {
            this._paginationWrapper.classList.remove(
                'cs-slider-pagination--fraction'
            );
            this._paginationWrapper.innerHTML = Array.from(
                { length: this.bulletsCount },
                (_: typeof undefined, i: number) =>
                    `<span class="cs-slider-pagination__bullet">${i + 1}</span>`
            ).join('');

            this._bullets = this._paginationWrapper.querySelectorAll(
                '.cs-slider-pagination__bullet'
            );
        }

        this.update();
    }

    /**
     * Calculates current pagination index
     */
    protected _setIndexes(): void {
        if (this.currentBulletIndex != null) {
            this.currentBulletIndex =
                this.currentBulletIndex <= this.bulletsCount
                    ? this.currentBulletIndex
                    : this.bulletsCount - 1;
        } else {
            this.currentBulletIndex = 0;
        }

        this.newBulletIndex = this.currentBulletIndex;
    }
}
