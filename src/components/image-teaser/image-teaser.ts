import ISliderNavigation from 'components/_slider/navigation/interface';
import ISliderPagination from 'components/_slider/pagination/interface';
import ISliderAutorotation from 'components/_slider/autorotation/interface';

/**
 * component options interface.
 */
export interface IImageTeaser {
    /**
     * Informs component about overall items count in slider
     * @required
     */
    itemsCount: number;
    /**
     * Informs component about amount of items per view
     * @required
     */
    itemsPerView: number;
    /**
     * Decides if pagination sub-module should be used (module is not even fetched if the value is falsy)
     * @default false
     */
    usePagination?: boolean;
    /**
     * Object containing navigation settings
     */
    navigationOptions: ISliderNavigation;
    /**
     * Object containing pagination settings
     */
    paginationOptions: ISliderPagination;
    /**
     * Selector of slides wrapper (scrollable element)
     * @default '.cs-image-teaser__slides'
     */
    slidesWrapperSelector: string;
    /**
     * Selector of single slide
     * @default '.cs-image-teaser__slide'
     */
    slideSelector: string;
    /**
     * Defines if autorotate should be enabled for this instance
     * @default false
     */
    useAutorotation?: boolean;
    /**
     * Decides about autorotate (see autorotate interface)
     */
    autorotationOptions: ISliderAutorotation;
    /**
     * Tells if configuration is set to "use_whole_screen"
     */
    useWholeScreen: boolean;
}

export default class ImageTeaser {
    public options: IImageTeaser = {
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
        useAutorotation: false,
        autorotationOptions: {
            delay: 6000,
        },
        useWholeScreen: false,
    };
    public currentItemsPerView: number;
    public navigation: any;
    public pagination: any;
    public autorotation: any;
    protected _$it: JQuery<HTMLElement>;
    protected _isTablet: MediaQueryList = window.matchMedia(`
        (min-width: ${window.breakpoint.phoneLg})
        and
        (max-width: ${window.breakpoint.laptop - 1})
    `);

    /**
     * Creates new ImageTeaser component with optional settings.
     * @param  {ImageTeaser} options  Optional settings object.
     */
    public constructor($element: JQuery<HTMLElement>, options?: IImageTeaser) {
        this.options = { ...this.options, ...options };
        this._$it = $element;
        this.currentItemsPerView = this._getCurrentItemsPerView();

        this._initNavigation();

        if (this.options.usePagination) {
            this._initPagination();
        }

        this._watchBreakpointChanges();
    }

    /**
     * Calculates current items per view option. This setting comes from CC settings (1-in-row, 3-in-row etc...)
     * @param breakpoint {number} optional breakpoint (screen-width in px) for which calculation should happen. If not passed, fallbacks to current window width.
     * @return number of items per view for given breakpoint
     */
    protected _getCurrentItemsPerView(
        breakpoint: number = window.innerWidth
    ): number {
        return this._isTablet?.matches && +this.options.itemsPerView === 4
            ? 2
            : breakpoint >= window.breakpoint.tablet
            ? this.options.itemsPerView
            : 1;
    }

    /**
     * ASYNC. Collects all Navigation Submodule options, imports module asynchronously and initializes with given settings.
     * @return Promise
     */
    protected async _initNavigation(): Promise<any> {
        const navigationOptions: ISliderNavigation = {
            ...{
                rootComponentNode: this._$it[0],
                collectionSize: this.options.itemsCount,
                itemsPerView: this.currentItemsPerView,
                slidesWrapperSelector: this.options.slidesWrapperSelector,
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
            this._$it[0].offsetParent != null
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
                rootComponentNode: this._$it[0],
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
        const autorotationOptions: ISliderNavigation = {
            ...{
                collectionSize: this.options.itemsCount,
                itemsPerView: this.currentItemsPerView,
                navInstance: this.navigation,
                pauseNode: this._$it[0].querySelector(
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
     * Listens to 'breakpointChange' event. When emitted, checks if 'currentItemsPerView' should be updated and updates if so. Afterwards it calls Navigation and Pagination API to set new items per view value and update those modules.
     */
    protected _watchBreakpointChanges(): void {
        document.addEventListener(
            'breakpointChange',
            (e: CustomEvent): void => {
                if (
                    this.currentItemsPerView !==
                    this._getCurrentItemsPerView(e.detail?.breakpoint)
                ) {
                    this.currentItemsPerView = this._getCurrentItemsPerView(
                        e.detail?.breakpoint
                    );
                    this.navigation?.setItemsPerView(this.currentItemsPerView);
                    this.pagination?.setItemsPerView(this.currentItemsPerView);
                }

                if (
                    this.options.useAutorotation &&
                    window.matchMedia('(hover:hover)').matches &&
                    this._$it[0].offsetParent != null &&
                    !this.autorotation
                ) {
                    this._initAutorotation();
                }
            }
        );
    }
}
