import * as $ from 'jquery';
import breakpoint from 'utils/breakpoint/breakpoint';

export default class Aftersearch {
    protected _$element: JQuery;
    protected _allFiltersVisible: boolean;
    protected _filtersExpandedClass: string;
    protected _$toggleButton: JQuery;
    protected _$toggleButtonTextSpan: JQuery;
    protected _$listOfFilters: JQuery;
    protected _widthOfElement: number;

    protected _eventListeners: {
        onFilterClick?: (event: Event) => void;
        onProductsGridHover?: (event: Event) => void;
        toggleButtonClick?: (event: Event) => void;
    } = {};

    public constructor($element: JQuery) {
        this._$element = $element;

        // Don't add horizontal features if there is no horizontal filters
        if (!this._$element.hasClass('cs-aftersearch-nav--horizontal-full')) {
            return;
        }
        this._allFiltersVisible = false;
        this._filtersExpandedClass = 'cs-aftersearch-nav--expanded';

        this._$toggleButton = this._$element.find(
            '.cs-aftersearch-nav__show-more-trigger'
        );
        this._$toggleButtonTextSpan = this._$element.find(
            '.cs-aftersearch-nav__show-more-trigger-text'
        );
        this._$listOfFilters = this._$element.find(
            '.cs-aftersearch-nav__filter'
        );

        this._widthOfElement = this._$listOfFilters.length
            ? $(this._$listOfFilters[0]).outerWidth()
            : 0;

        this._attachEvents();
    }

    /**
     *  Calculate height of collapsible elements to best fit available screen
     */
    protected _calculateOptimalHeight(
        initialHeight,
        $filterContent: JQuery,
        $filterTitle: JQuery
    ): number {
        const itemPosition: number =
            $filterContent.offset().top -
            $(window).scrollTop() +
            $filterTitle.outerHeight();

        const itemOffset: number = $(window).height() - itemPosition;
        const minimalFilterHeight: number = 200;
        const spaceBetweenFilterAndWindowBottom: number = 30;

        if (initialHeight > itemOffset - spaceBetweenFilterAndWindowBottom) {
            return itemOffset - spaceBetweenFilterAndWindowBottom <
                minimalFilterHeight
                ? minimalFilterHeight
                : itemOffset - spaceBetweenFilterAndWindowBottom;
        } else {
            return initialHeight;
        }
    }

    /**
     *  Set height of collapsible elements to best fit available screen
     */
    protected _setProperHeightOfFlyout($filter: JQuery): void {
        if ($(window).width() >= breakpoint.tablet) {
            const $filterContent: JQuery = $filter.find(
                'div.cs-aftersearch-nav__filter-content'
            );
            const $filterTitle: JQuery = $filter.find(
                '.cs-aftersearch-nav__filter-title'
            );

            // Remove height that was previously set to start with clean value
            $filterContent.css('height', '');

            const initialHeight: number = $filterContent.height();

            $filterContent.height(
                this._calculateOptimalHeight(
                    initialHeight,
                    $filterContent,
                    $filterTitle
                )
            );
        }
    }

    /**
     *  Prevent item cloner from overlapping filters
     */
    protected _setFilterAboveItemCloner($hoveredProduct: JQuery): void {
        const openFilter = $('.cs-aftersearch-nav__filter-content.active');
        if (openFilter.length) {
            const $hoverProductRect = $hoveredProduct
                .get(0)
                .getBoundingClientRect();
            const $openFilterRect = openFilter.get(0).getBoundingClientRect();
            const overlap = !(
                $openFilterRect.right < $hoverProductRect.left ||
                $openFilterRect.left > $hoverProductRect.right ||
                $openFilterRect.bottom < $hoverProductRect.top ||
                $openFilterRect.top > $hoverProductRect.bottom
            );
            if (overlap) {
                $('#maincontent').css('z-index', 303);
            } else {
                $('#maincontent').css('z-index', '');
            }
        } else {
            $('#maincontent').css('z-index', '');
        }
    }

    /**
     *  Add special class to right filter to align it properly
     */
    protected _setRightFilterClass(): void {
        const $filtersRows: JQuery = $('.cs-aftersearch-nav__filter-row');
        const $listOfFilters: JQuery = this._$listOfFilters;

        $.each($filtersRows, function(i: number, e: any): void {
            let offset: any = $(this).offset().left;
            if (
                $(window).width() -
                    offset -
                    2 * $($listOfFilters[0]).outerWidth() <
                0
            ) {
                $(this)
                    .find('.cs-aftersearch-nav__filter-content')
                    .addClass(
                        'cs-aftersearch-nav__filter-content--extremely-right'
                    );
            }
        });
    }

    /**
     *  Add z-indexes to correct alignment of filters
     */
    protected _fixFiltersOverlapping(): void {
        $('.cs-aftersearch-nav__filter-content').css('z-index', '1');
        $.each($('.cs-aftersearch-nav__filter-title'), function() {
            if ($(this).attr('aria-expanded') === 'true') {
                $(this).css('z-index', '4');
                $('.cs-aftersearch-nav__filter-content.active').css(
                    'z-index',
                    '3'
                );
            } else {
                $(this).css('z-index', '1');
            }
        });
    }

    /**
     *  Show/Hide more rows of filters
     */
    protected _toggleMoreFilters(): void {
        if (!this._allFiltersVisible) {
            this._$element.addClass(this._filtersExpandedClass);
            this._$toggleButtonTextSpan.text(
                this._$toggleButton.data('hide-text')
            );
            this._$toggleButton.addClass('show');
        } else {
            this._$element.removeClass(this._filtersExpandedClass);
            this._$toggleButtonTextSpan.text(
                this._$toggleButton.data('show-text')
            );
            this._$toggleButton.removeClass('show');
        }

        this._allFiltersVisible = !this._allFiltersVisible;

        const openFilters: JQuery = $(
            '.cs-aftersearch-nav__filter-title[aria-expanded="true"]'
        );

        if (openFilters.length) {
            openFilters.trigger('click');
        }
    }

    protected _attachEvents(): void {
        this._eventListeners.onFilterClick = (event: Event): void => {
            const $filterToOpen: JQuery = $(event.target).hasClass(
                'cs-aftersearch-nav__filter'
            )
                ? $(event.target)
                : $(event.target).closest('.cs-aftersearch-nav__filter');
            this._setProperHeightOfFlyout($filterToOpen);
            this._fixFiltersOverlapping();
            this._setRightFilterClass();
        };

        this._eventListeners.onProductsGridHover = (event: Event): void => {
            const $hoveredProduct: JQuery = $(event.target).hasClass(
                'cs-grid-product'
            )
                ? $(event.target)
                : $(event.target).closest('.cs-grid-product');
            this._setFilterAboveItemCloner($hoveredProduct);
        };

        this._eventListeners.toggleButtonClick = (event: Event): void => {
            this._toggleMoreFilters();
        };

        this._$listOfFilters.on('click', this._eventListeners.onFilterClick);
        $('.cs-grid-product').on(
            'mouseenter mouseleave',
            this._eventListeners.onProductsGridHover
        );
        this._$toggleButton.on('click', this._eventListeners.toggleButtonClick);
    }
}
