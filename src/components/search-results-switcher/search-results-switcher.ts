import * as $ from 'jquery';

/**
 * component options interface.
 */
interface ISearchresultsSwitcher {
    /**
     * Component's class
     * @type {string}
     * @default 'cs-search-results-switcher'
     */
    componentClass?: string;

    /**
     * Class of single trigger (tab link)
     * @type {string}
     * @default 'cs-search-results-switcher__trigger'
     */
    triggersClass?: string;

    /**
     * Class of single trigger (tab link) in the selected state
     * @type {string}
     * @default 'cs-tabs__title--active'
     */
    activeTriggerClass?: string;

    /**
     * Class of the single tab's content
     * @type {string}
     * @default 'cs-search-results-switcher__content'
     */
    contentsClass?: string;

    /**
     * Anchor of "Show All" tab (tab content)
     * @type {string}
     * @default '#all'
     */
    showAllAnchor?: string;

    /**
     * Anchor of "CMS Pages" tab (tab content)
     * @type {string}
     * @default '#tab-content-cmspages'
     */
    cmsResultsSelector?: string;

    /**
     * Anchor of "Products" tab (tab content)
     * @type {string}
     * @default '#tab-content-products'
     */
    productsResultsSelector?: string;

    /**
     * Tells if selected tab should be saved in sessionStorage (see WEB API documentation)
     * This setting has no effect for single type of results (for instance only Products or only CMS pages were found)
     * @type {boolean}
     * @default true
     */
    saveStateInSession?: boolean;

    /**
     * Selector of Filter's State block.
     * Needed for detecting if filters are selected so that Pages results are hidden in this case
     * @type {string}
     * @default '.cs-aftersearch-nav__state'
     */
    filtersStateSelector?: string;

    /**
     * Selector of Search Results Page
     * Needed for detecting if it is Search Results page or Category Page
     * @type {string}
     * @default '.catalogsearch-result-index'
     */
    searchResultPageClass?: string;
}

export default class SearchresultsSwitcher {
    protected _$component: JQuery;
    protected _options: ISearchresultsSwitcher;
    protected _$triggers: JQuery;
    protected _$tabs: JQuery;
    protected _$contents: JQuery;
    protected _$searchResultsPage: JQuery;

    /**
     * Creates new ProductsPromo component with optional settings.
     * @param {$element} Optional, element to be initialized as ProductsPromo component
     * @param {options}  Optional settings object.
     */
    public constructor(options?: ISearchresultsSwitcher) {
        this._options = $.extend(
            {
                componentClass: 'cs-search-results-switcher',
                triggersClass: 'cs-search-results-switcher__trigger',
                activeTriggerClass: 'cs-tabs__title--active',
                contentsClass: 'cs-search-results-switcher__content',
                showAllAnchor: '#all',
                cmsResultsSelector: '#tab-content-cmspages',
                productsResultsSelector: '#tab-content-products',
                saveStateInSession: true,
                filtersStateSelector: '.cs-aftersearch-nav__state',
                searchResultPageClass: 'catalogsearch-result-index',
            },
            options
        );

        this._$triggers = $(`.${this._options.triggersClass}`);
        this._$contents = $(`.${this._options.contentsClass}`);
        this._$searchResultsPage = $(`.${this._options.searchResultPageClass}`);

        if (this._$triggers.length && this._$contents.length > 1) {
            this._init();
        } else if (
            this._$contents.length === 0 &&
            this._$searchResultsPage.length
        ) {
            $('.cs-page-category__main').addClass(
                'cs-page-category__main--search-no-result'
            );

            const $msgs: JQuery = $(
                `.${this._options.componentClass}__messages`
            );

            if ($msgs.length) {
                $msgs.addClass(
                    `${this._options.componentClass}__messages--visible`
                );
            }
        } else {
            this.showContents();
        }
    }

    /**
     * Adds modifier to the tab(s) to show them.
     * If argument is not passed, it will add modifier to all tabs
     * @param {section} Optional, <JQuery> object to add modifier to
     */
    public showContents($section?: JQuery): void {
        if ($section && $section.length) {
            $section.addClass(`${this._options.contentsClass}--active`);
        } else {
            this._$contents.addClass(`${this._options.contentsClass}--active`);
        }
    }

    /**
     * Removed modifier from the tab(s) to hide them.
     * If argument is not passed, it will remove modifier from all tabs
     * @param {section} Optional, <JQuery> object to remove modifier from
     */
    public hideContents($section?: JQuery): void {
        if ($section && $section.length) {
            $section.removeClass(`${this._options.contentsClass}--active`);
        } else {
            this._$contents.removeClass(
                `${this._options.contentsClass}--active`
            );
        }
    }

    /**
     * Opens given tab and marks trigger as active (Adds modifier)
     * Additionaly if settings and an extra param allows, saves this choice to the sessionStorage
     * @param {$trigger} - <JQuery> object of tab trigger (tab link) containing anchor of the contents
     * @param {saveState} Optional - <boolean> tells if method should save current tab settings to sessionStorage
     */
    public openTab($trigger: JQuery, saveState: boolean = true): void {
        const $target: JQuery = $($trigger.attr('href'));
        const isShowAll: boolean =
            $trigger.attr('href') === this._options.showAllAnchor;

        if (isShowAll) {
            this.showContents();
        } else {
            if ($target.length) {
                this.hideContents();
                this.showContents($target);
            }
        }

        this._$tabs.removeClass(this._options.activeTriggerClass);
        $trigger.parent().addClass(this._options.activeTriggerClass);

        if (this._options.saveStateInSession && saveState) {
            sessionStorage.setItem(
                'searchresultsSwitcher',
                $trigger.attr('href')
            );
        }
    }

    /**
     * 1. Assingning necessary globals
     * 2. Checking if any filter was selected (by checking if filter's state is in DOM)
     *    - if true:
     *        a. showing only products results
     *    - if false:
     *        a. setting click event for switcher
     *        b. checking sessionStorage and if entry available setting the switcher to state saved in storage
     *        c. showing switcher
     */
    protected _init(): void {
        this._$component = $(`.${this._options.componentClass}`);
        this._$tabs = this._$triggers.parent();
        const urlParams: any = this._getUrlParams();

        this._setResultsCount();

        if (
            $(this._options.filtersStateSelector).length ||
            (urlParams.p !== undefined && parseInt(urlParams.p, 10) > 1)
        ) {
            const $productsTrigger: JQuery = this._$tabs.find(
                `a[href="${this._options.productsResultsSelector}"]`
            );
            if (
                $(this._options.productsResultsSelector).length &&
                $productsTrigger.length
            ) {
                this.openTab($productsTrigger, false);
            }
        } else {
            this._setEvents();

            if (
                this._options.saveStateInSession &&
                sessionStorage.getItem('searchresultsSwitcher')
            ) {
                const sectionName: string = sessionStorage.getItem(
                    'searchresultsSwitcher'
                );
                const $trigger: JQuery = this._$tabs.find(
                    `a[href="${sectionName}"]`
                );

                if ($trigger.length) {
                    this.openTab($trigger);
                }
            } else {
                this.showContents();
            }

            this._$component.show();
        }
    }

    /**
     * Collects all params from the URL and maps them to the object
     * Example:
     * {
     *    paramKey: paramValue,
     *    paramKey: paramValue
     * }
     */
    protected _getUrlParams(): any {
        const params: any = {};

        document.location.search
            .substr(1)
            .split('&')
            .forEach(
                (pair: string): any => {
                    const [key, value]: any = pair.split('=');
                    params[key] = value;
                }
            );

        return params;
    }

    protected _setResultsCount(): void {
        const $overallResultsCountHeadline: JQuery = $(
            `.${this._options.componentClass}__overall-count`
        );
        const $cmsResults: JQuery = $(this._options.cmsResultsSelector);
        const $productsResults: JQuery = $(
            this._options.productsResultsSelector
        );
        let cmsCount: number = 0;
        let productsCount: number = 0;

        if ($cmsResults.length) {
            const rawCmsCount: string = $cmsResults.find('h2 span').length
                ? $cmsResults.find('h2 span').text()
                : '';
            if (rawCmsCount.length) {
                cmsCount = parseInt(rawCmsCount, 10);
            }
        }

        if ($productsResults.length) {
            const rawProductsCount: string = $productsResults.find('h2 span')
                .length
                ? $productsResults.find('h2 span').text()
                : '';
            if (rawProductsCount.length) {
                productsCount = parseInt(rawProductsCount, 10);
            }
        }

        if ($('#count-cms').length) {
            $('#count-cms').html(cmsCount);
        }

        if ($('#count-products').length) {
            $('#count-products').html(productsCount);
        }

        if ($overallResultsCountHeadline.length) {
            const overallCount: any = cmsCount + productsCount;
            $overallResultsCountHeadline.html(overallCount);
        }
    }

    /**
     * Setups click event for all $triggers (tab links)
     */
    protected _setEvents(): void {
        const _component: any = this;

        this._$triggers.on('click', function(e: Event): void {
            e.preventDefault();
            const isShowAll: boolean = $(this).attr('href') === '#all';

            _component.openTab($(this));
        });
    }
}
