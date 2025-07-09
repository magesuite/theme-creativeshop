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
    searchResultAreas: SearchResultArea[];
}

type SearchResultArea = {
    containerSelector: string;
    countSelector: string;
    name: string;
};

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
                saveStateInSession: true,
                filtersStateSelector: '.cs-aftersearch-nav__state',
                searchResultPageClass: 'catalogsearch-result-index',
                searchResultAreas: [
                    {
                        containerSelector: '#tab-content-cmspages',
                        countSelector: '#count-cms',
                        name: 'pages',
                    },
                    {
                        containerSelector: '#tab-content-products',
                        countSelector: '#count-products',
                        name: 'products',
                    },
                    {
                        containerSelector: '#tab-content-blog',
                        countSelector: '#count-blog',
                        name: 'blog',
                    },
                    {
                        containerSelector: '#tab-content-brands',
                        countSelector: '#count-brands',
                        name: 'brands',
                    },
                ],
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

        this._$tabs.find(`.${this._options.triggersClass}`).attr('aria-selected', 'false');
        $trigger.attr('aria-selected', 'true');

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

        if (
            $(this._options.filtersStateSelector).length ||
            (urlParams.p !== undefined && parseInt(urlParams.p, 10) > 1)
        ) {
            const productSearchResultArea: SearchResultArea =
                this._options.searchResultAreas.find(
                    (area: SearchResultArea) => area.name === 'products'
                );
            if (productSearchResultArea) {
                const $container: JQuery = $(
                    productSearchResultArea.containerSelector
                );
                const $trigger: JQuery = this._$tabs.find(
                    `a[href="${productSearchResultArea.containerSelector}"]`
                );

                if ($container.length && $trigger.length) {
                    this._setResultsCount(true);
                    this.openTab($trigger, false);
                } else {
                    this._setResultsCount();
                }
            } else {
                this._setResultsCount();
            }
        } else {
            this._setResultsCount();
            this._setEvents();
            this._$component.show();

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
            .forEach((pair: string): any => {
                const [key, value]: any = pair.split('=');
                params[key] = value;
            });

        return params;
    }

    protected _setResultsCount(countOnlyProducts: boolean = false): void {
        if (!this._options.searchResultAreas?.length) {
            return;
        }

        const overallResultsCountHeadline = document.querySelector(
            `.${this._options.componentClass}__overall-count`
        );
        let allCount: number = 0;
        let productsCount: number = 0;

        for (const area of this._options.searchResultAreas) {
            const areaContainer = document.querySelector(
                area.containerSelector
            );
            const countElement = document.querySelector(area.countSelector);
            let count: number = 0;

            if (areaContainer) {
                const countElement = areaContainer.querySelector('h2 span');
                const rawCount = countElement ? countElement.textContent : '';
                if (rawCount.length) {
                    count = parseInt(rawCount, 10);
                }
            }

            allCount += count;
            if (area.name === 'products') {
                productsCount = count;
            }

            if (countElement) {
                countElement.textContent = count.toString();

                if (count === 0) {
                    const { parentElement } = countElement;
                    parentElement.classList.add('disabled');
                    parentElement.setAttribute('tabindex', '-1');
                    parentElement.setAttribute('aria-disabled', 'true');
                }
            }
        }

        if (overallResultsCountHeadline) {
            const overallCount: any = countOnlyProducts
                ? productsCount
                : allCount;
            overallResultsCountHeadline.textContent = overallCount.toString();
        }
    }

    /**
     * Setups click event for all $triggers (tab links)
     */
    protected _setEvents(): void {
        const _component: any = this;

        this._$triggers.on('click', function (e: Event): void {
            e.preventDefault();
            const isShowAll: boolean = $(this).attr('href') === '#all';

            _component.openTab($(this));
        });
    }
}
