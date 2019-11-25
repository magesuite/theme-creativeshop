import * as $ from 'jquery';
import breakpoint from 'utils/breakpoint/breakpoint';

export interface AftersearchNavOptions {
    horizontalClassName?: string;
    filtersExpandedClassName?: string;
    toggleButtonClassName?: string;
    filterClassName?: string;
    filterContentClassName?: string;
    filterContentRightClassName?: string;
    loaderClassName?: string;
    showLoaderOnClick?: boolean;
    loaderClickTargetsSelector?: string;
}

export class AftersearchNav {
    protected _$element: JQuery;
    protected _$toggleButton: JQuery;
    protected _$listOfFilters: JQuery;
    protected _isHorizontal = false;
    protected _options: AftersearchNavOptions = {
        horizontalClassName: 'cs-aftersearch-nav--horizontal',
        filtersExpandedClassName: 'cs-aftersearch-nav--expanded',
        toggleButtonClassName: 'cs-aftersearch-nav__toggle-button',
        filterClassName: 'cs-aftersearch-nav__filter',
        filterContentClassName: 'cs-aftersearch-nav__filter-content',
        filterContentRightClassName:
            'cs-aftersearch-nav__filter-content--align-right',
        loaderClassName: 'cs-aftersearch-nav__loader',
        showLoaderOnClick: true,
        loaderClickTargetsSelector:
            '.cs-aftersearch-nav-range__apply, .cs-aftersearch-nav .item, .cs-aftersearch-nav__swatch-link',
    };

    protected _eventListeners: {
        filterClick?: (event: JQuery.Event) => void;
        toggleButtonClick?: (event: JQuery.Event) => void;
        filterApply?: (event: JQuery.Event) => void;
    } = {};

    public constructor($element: JQuery, options?: AftersearchNavOptions) {
        this._$element = $element;
        this._options = $.extend(this._options, options);

        this._$toggleButton = this._$element.find(
            `.${this._options.toggleButtonClassName}`
        );
        this._$listOfFilters = this._$element.find(
            `.${this._options.filterClassName}`
        );

        this._isHorizontal = this._$element.hasClass(
            this._options.horizontalClassName
        );

        this._attachEvents();
    }

    /**
     * Method called when one of filter appliers is clicked.
     */
    protected _applyFilter() {
        this._$element.find(`.${this._options.loaderClassName}`).show();
    }

    protected _adjustDropdown(event) {
        const $filter: JQuery = $(event.target).closest(this._$listOfFilters);

        this._setProperHeightOfFlyout($filter);
        this._adjustCollapseAlignment($filter);
    }

    /**
     *  Set height of dropdown content elements to best fit available screen.
     */
    protected _setProperHeightOfFlyout($filter: JQuery): void {
        const $filterContent: JQuery = $filter.find(
            '.cs-aftersearch-nav__filter-content'
        );
        // Remove height that was previously set to start with clean value.
        $filterContent.css('max-height', '');

        if (!this._isHorizontal || $(window).width() < breakpoint.tablet) {
            return;
        }

        const clientRect = $filterContent.get(0).getBoundingClientRect();
        const windowHeight = $(window).height();
        const contentOverflow = clientRect.bottom - windowHeight;

        $filterContent.css(
            'max-height',
            Math.min(clientRect.height, clientRect.height - contentOverflow)
        );
    }

    /**
     *  Add right alignment class to dropdown content to prevent it from overflowing the screen.
     */
    protected _adjustCollapseAlignment($filter: JQuery): void {
        if (!this._isHorizontal || $(window).width() < breakpoint.tablet) {
            return;
        }

        const $filterContent = $filter.find(
            `.${this._options.filterContentClassName}`
        );
        const $filterOptions = $filter.parent();
        const filterOptionsWidth = $filterOptions.width();
        const filterOptionsOffset = $filterOptions.offset();
        const filterOffset = $filter.offset();

        if (
            filterOffset.left - filterOptionsOffset.left >=
            filterOptionsWidth / 2
        ) {
            $filterContent.addClass(this._options.filterContentRightClassName);
        } else {
            $filterContent.removeClass(
                this._options.filterContentRightClassName
            );
        }
    }

    /**
     *  Toggle visibility of additional filters.
     */
    protected _toggleFilters(): void {
        const areFiltersExpanded = this._$element.hasClass(
            this._options.filtersExpandedClassName
        );
        const ariaValue = areFiltersExpanded ? 'false' : 'true';

        this._closeCollapses(this._$listOfFilters);

        this._$toggleButton
            .attr('aria-expanded', ariaValue)
            .attr('aria-selected', ariaValue);
        this._$element.toggleClass(this._options.filtersExpandedClassName);
    }

    protected _closeCollapses($collapses: JQuery): void {
        try {
            $collapses.each((_, element) => {
                $(element).collapsible('deactivate');
            });
        } catch (error) {
            // Discard "collapses not yet initialized" error.
        }
    }

    protected _attachEvents(): void {
        this._eventListeners.filterClick = this._adjustDropdown.bind(this);
        this._eventListeners.toggleButtonClick = this._toggleFilters.bind(this);
        this._eventListeners.filterApply = this._applyFilter.bind(this);

        this._$listOfFilters.on('click', this._eventListeners.filterClick);
        this._$toggleButton.on('click', this._eventListeners.toggleButtonClick);
        $(document).on(
            'click',
            this._options.loaderClickTargetsSelector,
            this._eventListeners.filterApply
        );
    }
}
