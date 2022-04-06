import ISlider from 'components/_slider/interface';
import ISliderNavigation from 'components/_slider/navigation/interface';
import ISliderPagination from 'components/_slider/pagination/interface';
import ISliderAutorotation from 'components/_slider/autorotation/interface';

declare global {
    interface Window {
        breakpoint: any;
        __smoothScrollPolyfilled: boolean;
    }
}

export default class Slider {
    public options: ISlider = {
        usePagination: false,
        slidesWrapperSelector: '.cs-image-teaser__slides',
        slideSelector: '.cs-image-teaser__slide',
        paginationOptions: {
            fractionBreakpoint: 10,
            fractionTemplate: '<span class="current">%c</span> / %a',
        },
        navigationOptions: {},
        itemsCount: 1,
        itemsPerView: 1,
        columnsConfig: null,
        useAutorotation: false,
        autorotationOptions: {
            delay: 6000,
        },
        useWholeScreen: false,
        componentType: 'image_teaser',
    };
    public currentItemsPerView: number;
    public slides: NodeListOf<HTMLElement>;
    public navigation: any;
    public pagination: any;
    public autorotation: any;
    public observer: IntersectionObserver;
    protected _instanceNode: HTMLElement;
    protected _slideGroups: HTMLElement[][];
    protected _isIntersectionObserverInitialized: boolean;
    protected _isTablet: MediaQueryList = window.matchMedia(`
        (min-width: ${window.breakpoint.phoneLg}px)
        and
        (max-width: ${window.breakpoint.laptop - 1}px)
    `);

    /**
     * Creates new Slider component with optional settings.
     * @param {ISlider} options  Optional settings object.
     */
    public constructor(element: HTMLElement, options?: ISlider) {
        this.options = { ...this.options, ...options };
        this._instanceNode = element;
        this.currentItemsPerView = this._getCurrentItemsPerView();
        this.slides = element.querySelectorAll(this.options.slideSelector);

        this._setIntersectionObserver();
        this._observe();
        this._initNavigation();
        this._smoothScrollPolyfill();

        if (this.options.usePagination) {
            this._initPagination();
        }

        this._watchBreakpointChanges();
    }

    /**
     * When 'itemsPerView' changes, reset observer and inform children modules
     */
    public rebuild(): void {
        this.navigation?.setItemsPerView(this.currentItemsPerView);
        this.pagination?.setItemsPerView(this.currentItemsPerView);

        this._slideGroups.forEach(group => this.observer.unobserve(group[0]));
        this._observe();
    }

    /**
     * Updates currentItemsPerView to given number and rebuilds module (and children modules)
     * @param itemsPerView {number} updated number of items per view to be applied
     */
    public setCurrentItemsPerView(itemsPerView: number): void {
        this.currentItemsPerView = itemsPerView;
        this.rebuild();
    }

    /**
     * Calculates current items per view option. This setting comes from CC settings (1-in-row, 3-in-row etc...)
     * @param breakpoint {number} optional breakpoint (screen-width in px) for which calculation should happen. If not passed, fallbacks to current window width.
     * @return number of items per view for given breakpoint
     */
    protected _getCurrentItemsPerView(newBreakpoint?: number): number {
        if (this.options.columnsConfig) {
            const ipv: number = +this.options.columnsConfig[
                this._getCurrentBreakpointName(newBreakpoint)
            ];

            if (ipv) {
                return ipv;
            }
        }

        if (!newBreakpoint) {
            newBreakpoint = window.innerWidth;
        }

        return this._isTablet?.matches &&
            this.options.componentType === 'image_teaser' &&
            +this.options.itemsPerView === 4 // for 4-in-row ITs, we force 2-in-row on tablet resolutions
            ? 2
            : newBreakpoint >= window.breakpoint.tablet
            ? this.options.itemsPerView
            : 1;
    }

    /**
     * Gets current breakpoint name (key of window.breakpoint).
     * @param breakpoint {number} optional. If passed, object will be looking for key with given value assigned
     * @return {string} key with breakpoint's name
     */
    protected _getCurrentBreakpointName(newBreakpoint?: number): string {
        if (newBreakpoint) {
            return Object.keys(window.breakpoint).find(
                key => window.breakpoint[key] === newBreakpoint
            );
        }

        return Object.keys(
            Object.keys(window.breakpoint)
                .filter(
                    key =>
                        key !== 'current' &&
                        window.breakpoint[key] === window.breakpoint.current
                )
                .reduce(
                    (res: string | object, key: string) => (
                        // tslint:disable-next-line:ban-comma-operator
                        (res[key] = window.breakpoint[key]), res
                    ),
                    {}
                )
        )[0];
    }

    /**
     * Safari < 15.1 do not support scrolling options (smooth scroll)
     * If no "scrollBehavior" property is detected, import asynchronously and apply polyfill
     */
    protected _smoothScrollPolyfill(): void {
        if (
            !('scrollBehavior' in document.documentElement.style) &&
            !window.__smoothScrollPolyfilled
        ) {
            import('smoothscroll-polyfill').then(smoothscroll => {
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
     * ASYNC. Collects all Navigation Submodule options, imports module asynchronously and initializes with given settings.
     * @return Promise
     */
    protected async _initNavigation(): Promise<any> {
        const navigationOptions: ISliderNavigation = {
            ...{
                rootComponentNode: this._instanceNode,
                collectionSize: this.options.itemsCount,
                itemsPerView: this.currentItemsPerView,
                scrollableElementSelector: this.options.slidesWrapperSelector,
                slideSelector: this.options.slideSelector,
                useWholeScreen: this.options.useWholeScreen,
            },
            ...this.options.navigationOptions,
        };

        const { default: SliderNavigation } = await import(
            'components/_slider/navigation/navigation'
        );
        this.navigation = new SliderNavigation(navigationOptions);

        if (
            this.options.useAutorotation &&
            window.matchMedia('(hover:hover)').matches &&
            this._instanceNode.offsetParent != null
        ) {
            this._initAutorotation();
        }
    }

    /**
     * ASYNC. Collects all Pagination Submodule options, imports module asynchronously and initializes with given settings.
     * @return Promise
     */
    protected async _initPagination(): Promise<any> {
        const paginationOptions: ISliderPagination = {
            ...{
                rootComponentNode: this._instanceNode,
                collectionSize: this.options.itemsCount,
                itemsPerView: this.currentItemsPerView,
                slidesWrapperSelector: this.options.slidesWrapperSelector,
                slideSelector: this.options.slideSelector,
            },
            ...this.options.paginationOptions,
        };

        const { default: SliderPagination } = await import(
            'components/_slider/pagination/pagination'
        );
        this.pagination = new SliderPagination(paginationOptions);
    }

    /**
     * ASYNC. Collects all Autorotation Submodule options, imports module asynchronously and initializes with given settings.
     * @return Promise
     */
    protected async _initAutorotation(): Promise<any> {
        const autorotationOptions: ISliderAutorotation = {
            ...{
                collectionSize: this.options.itemsCount,
                itemsPerView: this.currentItemsPerView,
                navInstance: this.navigation,
                pauseNode: this._instanceNode.querySelector(
                    '.cs-image-teaser__slides-wrapper'
                ),
            },
            ...this.options.autorotationOptions,
        };

        const { default: SliderAutorotation } = await import(
            'components/_slider/autorotation/autorotation'
        );
        this.autorotation = new SliderAutorotation(autorotationOptions);
    }

    /**
     * Creates intersection observer and handles intersecting callbacks by distributing it to sub-modules
     */
    protected _setIntersectionObserver(): void {
        this.observer = new IntersectionObserver(
            entries =>
                entries.forEach((entry: IntersectionObserverEntry) => {
                    if (entry.isIntersecting) {
                        if (this.navigation) {
                            this.navigation.handleIntersect(entry);
                        }
                        if (this.pagination) {
                            this.pagination.handleIntersect(entry);
                        }
                    }
                }),
            {
                root: this.slides[0].parentNode as HTMLElement,
                threshold: 0.5,
            }
        );
    }

    /**
     * Creates "groups" of slides to observe by slicing array to multiple arrays containing amount of elements qual itemsPerView. Last array contains rest of items.
     * Example: Slides = [1,2,3,4,5,6,7,8,9], itemsPerView: 4 = [[1,2,3,4], [5,6,7,8], [9]]
     */
    protected _observe(): void {
        this._slideGroups = Array.from(
            new Array(Math.ceil(this.slides.length / this.currentItemsPerView)),
            (_: typeof undefined, i: number) =>
                Array.from(this.slides).slice(
                    i * this.currentItemsPerView,
                    i * this.currentItemsPerView + this.currentItemsPerView
                )
        );

        this._slideGroups.forEach(group => this.observer.observe(group[0]));
    }

    /**
     * Listens to 'breakpointChange' event. When emitted, checks if 'currentItemsPerView' should be updated and updates if so. Afterwards it calls Navigation and Pagination API to set new items per view value and update those modules.
     * @TODO: get rid of jquery
     */
    protected _watchBreakpointChanges(): void {
        document.addEventListener(
            'breakpointChange',
            (e: CustomEvent): void => {
                const newItemsPerView: number = this._getCurrentItemsPerView(
                    e.detail?.breakpoint
                );

                if (this.currentItemsPerView !== newItemsPerView) {
                    this.currentItemsPerView = newItemsPerView;

                    this.rebuild();
                }

                if (
                    this.options.useAutorotation &&
                    window.matchMedia('(hover:hover)').matches &&
                    this._instanceNode.offsetParent != null &&
                    !this.autorotation
                ) {
                    this._initAutorotation();
                }
            },
            false
        );
    }
}
