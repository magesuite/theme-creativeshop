import $ from 'jquery';

/**
 * Full search scripts
 */
interface FullSearchOptions {
    /**
     * Below that breakpoint search input has normal behaviour and position
     * @type {number}
     */
    breakpoint?: number;
    /**
     * Trigger element active class (it is added when full search is visible
     * @type {number}
     */
    triggerActiveClass?: string;
    /**
     * Close element active class (it is added when full search is visible
     * @type {number}
     */
    closeActiveClass?: string;
}

export default class FullSearch {
    protected _$headerSearch: JQuery;
    protected _$headerParent: JQuery;
    protected _$fullSearchTrigger: JQuery;
    protected _$fullSearchClose: JQuery;
    protected _$window: JQuery = $(window);
    protected _headerNavSelector: string;
    protected _eventListeners: {
        resizeListener?: (event: Event) => void;
        clickOnTrigger?: (event: Event) => void;
        clickOnCloser?: (event: Event) => void;
        clickOutside?: (event: Event) => void;
    } = {};
    protected _resizeTimeout: number;
    protected _isSearchFormMoved: boolean = false;

    protected _options: FullSearchOptions = {
        breakpoint: 1024,
    };

    /**
     * Creates full search input with optional settings.
     * @param  {FullSearchOptions} options  Optional settings object.
     */
    public constructor(options?: FullSearchOptions) {
        this._$headerSearch = $('#search_mini_form');

        // Don't throw errors if there is no search on the website.
        if (this._$headerSearch.length === 0) {
            return;
        }

        this._$headerParent = this._$headerSearch.parent();
        this._$fullSearchTrigger = $('[data-trigger="search-form"]');
        this._$fullSearchClose = $('[data-close="search-form"]');
        this._headerNavSelector = '.cs-navigation';

        this._options = $.extend(this._options, options);

        this._moveSearchFormOntoNavigation();

        this._attachEvents();
    }

    /**
     * Show full search
     */
    public showFullSearch(): void {
        this._$headerSearch.show();

        if(this._options.triggerActiveClass) {
            this._$fullSearchTrigger.addClass(this._options.triggerActiveClass);
        }

        if(this._options.closeActiveClass) {
            this._$fullSearchClose.addClass(this._options.closeActiveClass);
        }

        const $searchInput = this._$headerSearch.find('input');
        if (this._$headerSearch.is(':visible') && !$searchInput.is(':focus')) {
            this._$headerSearch.find('input').focus();
        }
    }

    /**
     * Hide full search
     */
    public hideFullSearch(): void {
        this._$headerSearch.hide();

        if(this._options.triggerActiveClass) {
            this._$fullSearchTrigger.removeClass(this._options.triggerActiveClass);
        }

        if(this._options.closeActiveClass) {
            this._$fullSearchClose.removeClass(this._options.closeActiveClass);
        }
    }

    /**
     * Destroys full search component.
     */
    public destroy(): void {
        this._detachEvents();
    }

    /**
     * Below breakpoint that method restore the original place of search form,
     * above or equal to breakpoint it moves search form onto full search
     */
    protected _moveSearchFormOntoNavigation(): void {
        if (
            this._$window.innerWidth() >= this._options.breakpoint &&
            !this._isSearchFormMoved
        ) {
            this._$headerSearch.appendTo(this._headerNavSelector);
            $(this._headerNavSelector).css('position', 'relative');
            this._isSearchFormMoved = true;
        } else if (
            this._$window.innerWidth() < this._options.breakpoint &&
            this._isSearchFormMoved
        ) {
            this._$headerParent.append(this._$headerSearch);
            $(this._headerNavSelector).css('position', '');
            this._isSearchFormMoved = false;
        }
    }

    /**
     * Attaches events needed by full search component.
     */
    protected _attachEvents(): void {
        this._eventListeners.resizeListener = (): void => {
            clearTimeout(this._resizeTimeout);
            setTimeout(() => {
                this._moveSearchFormOntoNavigation();
            }, 250);
        };
        this._$window.on(
            'resize orientationchange',
            this._eventListeners.resizeListener
        );

        this._eventListeners.clickOnTrigger = (event: Event): void => {
            if (this._$headerSearch.is(':visible')) {
                this.hideFullSearch();
            } else {
                this.showFullSearch();
            }
        };

        this._eventListeners.clickOnCloser = (event: Event): void => {
            this.hideFullSearch();
        };

        this._eventListeners.clickOutside = (event: Event): void => {
            if (
                !$(event.target)
                    .closest(this._$fullSearchTrigger)
                    .get(0) &&
                !$(event.target)
                    .closest(this._$headerSearch)
                    .get(0) &&
                this._$window.innerWidth() >= this._options.breakpoint
            ) {
                this.hideFullSearch();
            }
        };

        this._$fullSearchTrigger.on(
            'click',
            this._eventListeners.clickOnTrigger
        );
        this._$fullSearchClose.on('click', this._eventListeners.clickOnCloser);
        this._$window.on(
            'mousedown touchend',
            this._eventListeners.clickOutside
        );
    }

    /**
     * Detaches events set by full search component.
     */
    protected _detachEvents(): void {
        this._$window.off(
            'resize orientationchange',
            this._eventListeners.resizeListener
        );
        this._$window.off(
            'mousedown touchend',
            this._eventListeners.clickOutside
        );
        this._$fullSearchTrigger.off(
            'click',
            this._eventListeners.clickOnTrigger
        );
        this._$fullSearchClose.off('click', this._eventListeners.clickOnCloser);
    }
}
