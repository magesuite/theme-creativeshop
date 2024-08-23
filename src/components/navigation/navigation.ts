import * as $ from 'jquery';

/**
 * Navigation component options interface.
 */
export interface NavigationOptions {
    /**
     * Class name of navigation container. Flyout positions will be calculated
     * relative to this element.
     */
    containerClassName?: string;
    /**
     * Navigation list item element. It is used to enhance keyboard accessability.
     */
    itemClassName?: string;

    /**
     * Navigation list item link element
     */
    itemLinkClassName?: string;
    /**
     * Navigation flyout class name.
     */
    flyoutClassName?: string;
    /**
     * Navigation flyout columns container class name.
     */
    flyoutColumnsClassName?: string;
    /**
     * Desired max height of the flyout. Number of columns will be decreased until
     * flyout's height will be smaller then given max height.
     */
    flyoutMaxHeight?: number;
    /**
     * Class name that will be added to extra navigation content (featured product, navigation teaser)
     */
    flyoutExtrasClassName?: string;
    /**
     * Maximum number of columns with categories that flyout can have.
     * This value can be an object with different values per breakpoint or a number.
     */
    flyoutMaxColumnCount?: { [minWidth: number]: number } | number;
    /**
     * Tells how flyout should be aligned in relation to navigation item.
     * Possible values are:
     * - "center" - center of the flyout will be align to the center of an item.
     * - "left" - left edge of the flyout will be aligned to the left edge of an item.
     * - "right" - right edge of the flyout will be aligned to the left edge of an item.
     */
    flyoutAlignTo?: string;
    /**
     * Tells when navigation should switch between "left" and "right" align modes.
     * E.g. value "3" will align first 3 flyout normally and then switch, you
     * can also write "-3" to align normally for all but last 3 flyouts.
     */
    flyoutAlignSwitch?: number;
    /**
     * Number of miliseconds to wait for next resize event before recalculating flyout positions.
     */
    resizeDebounce?: number;
    /**
     * Number of miliseconds to wait after hovering the mouse over a link before showing the flyout.
     */
    flyoutShowDelay?: number;
    /**
     * Round transform left on flyout to avoid blur in text..
     */
    roundTransformLeft?: boolean;
    /**
     * if showNavigationOverlay is set to TRUE, overlay will be shown on the content and all elements under it
     */
    contentSelector?: string;
    /**
     * Tells if active category should be highlighted
     */
    highlightActiveCategory?: boolean;
    /**
     * If highlightActiveCategory is set to true, it let you decide if whole category tree should be highlighted
     */
    highlightWholeTree?: boolean;
    /**
     * Class name of active category (as addition to original)
     */
    activeCategoryClassName?: string;
    /**
     * if markCategoriesWithNoChildren is set to TRUE, categories level_1 with no subcategories of level_2
     * receive modifier class. Default: false
     */
    markCategoriesWithNoChildren?: boolean;
    /**
     * Modifier class for categories with no children
     */
    categoriesWithNoChildrenClass?: string;
    /**
     * In some projects, with quite hight navigation and big flyouts, some mouse moves intended to end on the active flyout, actually trigger another flyout
     * To avoid the problem active flyout is will not be hidden when mouse move is to-bottom and mouse leave the active item in left-bottom or right-bottom edge
     */
    enhancedFlyoutHover?: boolean;
}

/**
 * Dropdown navigation that supports 3 category level links.
 */
export default class Navigation {
    protected _$element: JQuery;
    protected _$window: JQuery<Window>;
    protected _viewportWidth: number;
    protected _$container: JQuery;
    protected _containerClientRect: ClientRect;
    protected _$flyouts: JQuery;
    protected _$content: JQuery;
    protected _$overlay: JQuery;
    protected _eventListeners: {
        resizeListener?: (event: JQuery.ResizeEvent) => void;
        itemFocusInListener?: (event: JQuery.FocusInEvent) => void;
        flyoutFocusInListener?: (event: JQuery.FocusInEvent) => void;
        focusOutListener?: (event: JQuery.FocusOutEvent) => void;
        itemTouchStartListener?: (event: JQuery.TouchStartEvent) => void;
        windowTouchStartListener?: (event: JQuery.TouchStartEvent) => void;
        itemMouseenterListener?: (
            event: JQuery.MouseEnterEvent | JQuery.ClickEvent
        ) => void;
        itemMouseleaveListener?: (
            event: JQuery.MouseLeaveEvent | JQuery.ClickEvent
        ) => void;
        itemMousemoveListener?: (
            event: JQuery.MouseMoveEvent | JQuery.ClickEvent
        ) => void;
        navigationMouseleaveListener?: (event: JQuery.MouseLeaveEvent) => void;
    } = {};
    protected _resizeTimeout: any;
    protected _showTimeout: any;
    protected _moveDirection: any;
    protected _oldX: number;
    protected _oldY: number;

    protected _options: NavigationOptions = {
        containerClassName: 'cs-navigation__list--main',
        itemClassName: 'cs-navigation__item',
        itemLinkClassName: 'cs-navigation__link',
        flyoutClassName: 'cs-navigation__flyout',
        flyoutColumnsClassName: 'cs-navigation__list--level_1',
        flyoutExtrasClassName: 'cs-navigation__extras',
        flyoutMaxHeight: 400,
        flyoutMaxColumnCount: {
            1023: 4,
            1279: 5,
        },
        resizeDebounce: 100,
        flyoutShowDelay: 200,
        flyoutAlignTo: 'center',
        flyoutAlignSwitch: 0,
        roundTransformLeft: true,
        contentSelector: '#maincontent',
        highlightActiveCategory: true,
        highlightWholeTree: true,
        activeCategoryClassName: 'active',
        markCategoriesWithNoChildren: false,
        categoriesWithNoChildrenClass: 'cs-navigation__item--no-children',
        enhancedFlyoutHover: false,
    };

    /**
     * Creates new navigation component on given jQuery element with optional settings.
     * @param  {JQuery}            $element jQuery element to initialize navigation on.
     * @param  {NavigationOptions} options  Optional settings object.
     */
    public constructor($element: JQuery, options?: NavigationOptions) {
        // Don't throw errors if there is no navigation on the website.
        if ($element.length === 0) {
            return;
        }
        this._$element = $element;
        this._$window = $(window);
        this._viewportWidth = this._$window.width();
        this._options = $.extend(this._options, options);
        this._$content = $(this._options.contentSelector);
        this._$flyouts = $element.find(`.${this._options.flyoutClassName}`);
        this._oldX = 0;
        this._oldY = 0;
        this._$container = $element
            .find(`.${this._options.containerClassName}`)
            .addBack(`.${this._options.containerClassName}`); // Allow navigation parent to be container itself.

        if (this._options.highlightActiveCategory) {
            this._highlightActiveCategory();
        }
        if (this._options.markCategoriesWithNoChildren) {
            this._selectCategoriesWithNoChildren();
        }
        this._attachEvents();
        this._openIfHovered();
    }

    /**
     * Destroys navigation component.
     */
    public destroy(): void {
        this._detachEvents();
    }

    /**
     * Handles the case when user hovered over certain navigation item
     * before scripts were initialized and event listeners hooked.
     */
    protected _openIfHovered(): void {
        if (!Element.prototype.matches) {
            return;
        }

        const $rootItems: JQuery = $(`.${this._options.itemClassName}--main`);
        $rootItems.each((index: number, element: HTMLElement) => {
            if (element.matches(':hover')) {
                $(element).trigger('mouseenter');
                // Break after first found element.
                return false;
            }
        });
    }

    /**
     * Highlights active category by adding ${this._options.activeCategoryClassName}
     * class either to only last level category or whole category tree depending on component's settings.
     */
    protected _highlightActiveCategory(): void {
        const $activeCategoryIndicator: JQuery = $('#active-category-path');
        if (!$activeCategoryIndicator.length) {
            return;
        }

        const activeCategoryPath: string[] = `${$activeCategoryIndicator.data(
            'active-category-path'
        )}`.split('/');

        const activeCategoryId: string =
            activeCategoryPath && activeCategoryPath.length
                ? activeCategoryPath[activeCategoryPath.length - 1]
                : null;

        if (activeCategoryId && activeCategoryId !== '0') {
            const $activeCategoryEl: JQuery = this._$container.find(
                `[data-category-id="${activeCategoryId}"]`
            );

            if ($activeCategoryEl.length) {
                $activeCategoryEl
                    .addClass(this._options.activeCategoryClassName)
                    .data(
                        'active-class',
                        this._options.activeCategoryClassName
                    );

                if (this._options.highlightWholeTree) {
                    $activeCategoryEl
                        .parentsUntil(this._$container, '[data-category-id]')
                        .addClass(this._options.activeCategoryClassName)
                        .data(
                            'active-class',
                            this._options.activeCategoryClassName
                        );
                }
            }
        } else {
            const currentUrl = window.location.href;
            const $rootItemsLinks: JQuery = $(
                `.${this._options.itemLinkClassName}--main`
            );

            $rootItemsLinks.each((index: number, element: HTMLElement) => {
                if (element.getAttribute('href') === currentUrl) {
                    element.parentElement.classList.add(
                        this._options.activeCategoryClassName
                    );
                }
            });
        }
    }

    /**
     * Adds modifier ${this._options.categoriesWithNoChildrenModifier} to item level_1
     * if it doesn't have children categories of level_2 to enhance styling
     */
    protected _selectCategoriesWithNoChildren(): void {
        const $firstLevelCategories: JQuery = $(
            `.${this._options.itemClassName}--level_1`
        );

        $firstLevelCategories.each((index: number, element: HTMLElement) => {
            if ($(element).children('ul').length === 0) {
                $(element).addClass(
                    this._options.categoriesWithNoChildrenClass
                );
            }
        });
    }

    /**
     * Adjusts flyout number of columns and positioning.
     * @param {JQuery} $flyout jQuery flyout element.
     */
    protected _adjustFlyout($flyout: JQuery): void {
        this._setTransform($flyout, '');
        this._adjustFlyoutExtras($flyout);
        this._adjustFlyoutColumns($flyout);

        let alignTo: string = this._options.flyoutAlignTo;
        const itemsLength: number = $(
            `.${this._options.itemClassName}--main`
        ).length;
        const alignSwitch = this._options.flyoutAlignSwitch;
        const switchAt =
            alignSwitch > 0 ? alignSwitch : alignSwitch + itemsLength;
        const flyoutIndex = $flyout
            .closest(`.${this._options.itemClassName}--main`)
            .index();
        if (
            flyoutIndex === switchAt &&
            (alignTo === 'left' || alignTo === 'right')
        ) {
            alignTo = alignTo === 'left' ? 'right' : 'left';
        }
        this._adjustFlyoutPosition($flyout, alignTo);
    }

    /**
     * Makes sure that all extra elements (image teaser, product promo) have proper width.
     * @param {JQuery} $flyout jQuery flyout element.
     */
    protected _adjustFlyoutExtras($flyout: JQuery) {
        const flyoutMaxColumnCount = this._getColumnsForViewport();
        const $flyoutExtras: JQuery = $flyout
            .children(`:not(.${this._options.flyoutColumnsClassName})`)
            .not('link, script');

        $flyoutExtras
            .css({
                width: `${
                    this._getContainerClientRect().width / flyoutMaxColumnCount
                }px`,
            })
            .addClass(this._options.flyoutExtrasClassName);
    }

    /**
     * Adjusts the number of flyout columns.
     * The goal is to have as few columns as possible when keeping flyout's height bellow given max height.
     * @param {JQuery} $flyout jQuery collection for flyout element.
     */
    protected _adjustFlyoutColumns($flyout: JQuery): void {
        const $flyoutColumns: JQuery = $flyout.find(
            `.${this._options.flyoutColumnsClassName}`
        );
        this._setColumnCount($flyoutColumns, 1);

        const extraElementsCount = $flyout.children(
            `.${this._options.flyoutExtrasClassName}`
        ).length;

        const flyoutMaxHeight: number = this._options.flyoutMaxHeight;
        const flyoutMaxColumns: number = extraElementsCount
            ? this._getColumnsForViewport() - extraElementsCount
            : this._getColumnsForViewport();

        let flyoutHeight: number = $flyout.height();
        let prevFlyoutHeight: number = 0;

        for (
            let flyoutColumnCount = 1;
            flyoutColumnCount < flyoutMaxColumns;
            flyoutColumnCount += 1
        ) {
            // Flyout height didn't decrease despite having more columns.
            if (Math.abs(flyoutHeight - prevFlyoutHeight) <= 10) {
                this._setColumnCount($flyoutColumns, flyoutColumnCount - 1);
                break;
            }
            // Flyout is still too high.
            if (flyoutHeight >= flyoutMaxHeight + 100) {
                this._setColumnCount($flyoutColumns, flyoutColumnCount + 1);
            }
            prevFlyoutHeight = flyoutHeight;
            flyoutHeight = $flyout.height();
        }
    }

    /**
     * Adjusts the position of the flyout so that the center of flyout columns
     * section is aligned to the center of trigger element as close as possible.
     * @param {JQuery} $flyout jQuery flyout element collection.
     */
    protected _adjustFlyoutPosition(
        $flyout: JQuery,
        alignTo: string = 'center'
    ): void {
        const flyoutClientRect: ClientRect = $flyout
            .get(0)
            .getBoundingClientRect();
        const containerClientRect: ClientRect = this._getContainerClientRect();
        const flyoutTriggerClientRect: ClientRect = $flyout
            .parent()
            .get(0)
            .getBoundingClientRect();

        // Check if flyout takes all width, if it does we don't have to calculate anything.
        if (flyoutClientRect.width === containerClientRect.width) {
            return;
        }

        let flyoutTransformLeft: number = 0;
        if (alignTo === 'left') {
            // Align left edge of columns with links to left edge of the flyout trigger.
            flyoutTransformLeft =
                flyoutTriggerClientRect.left - containerClientRect.left;
        } else if (alignTo === 'right') {
            // Align left edge of columns with links to left edge of the flyout trigger.
            flyoutTransformLeft =
                flyoutTriggerClientRect.left +
                flyoutTriggerClientRect.width -
                containerClientRect.left -
                flyoutClientRect.width;
        } else {
            // Align center of columns with links to center of the flyout trigger.
            flyoutTransformLeft =
                flyoutTriggerClientRect.left -
                containerClientRect.left +
                flyoutTriggerClientRect.width / 2 -
                flyoutClientRect.width / 2;
        }
        // Make sure we don't pull flyout left out of container.
        flyoutTransformLeft = Math.max(0, flyoutTransformLeft);
        // Check if flyout would overflow container on the right.
        if (
            flyoutTransformLeft + flyoutClientRect.right >
            containerClientRect.right
        ) {
            // If it would then stick it to the right side.
            flyoutTransformLeft = Math.floor(
                containerClientRect.width - flyoutClientRect.width
            );
        }

        flyoutTransformLeft = this._options.roundTransformLeft
            ? Math.round(flyoutTransformLeft)
            : flyoutTransformLeft;

        this._setTransform(
            $flyout,
            `translate3d(${flyoutTransformLeft}px, 0, 0)`
        );
    }

    /**
     * Sets the number of columns for the given element.
     * @param  {JQuery} $element    Element to set property to.
     * @param  {number} columnCount Number of columns to set.
     */
    protected _setColumnCount($element: JQuery, columnCount: number): void {
        const flyoutMaxColumnCount = this._getColumnsForViewport();

        $element.css({
            'column-count': columnCount,
            width: `${
                (this._getContainerClientRect().width / flyoutMaxColumnCount) *
                columnCount
            }px`,
        });
        this._triggerColumnsReflow($element);
    }

    /**
     * Sets transform CSS property on a given element.
     * @param  {JQuery} $element  Element to set transform to.
     * @param  {string} transform Transform value string.
     */
    protected _setTransform($element: JQuery, transform: string): void {
        $element.css({
            transform: transform,
        });
    }

    protected _getContainerClientRect(): ClientRect {
        if (!this._containerClientRect) {
            this._containerClientRect = this._$container
                .get(0)
                .getBoundingClientRect();
        }

        return this._containerClientRect;
    }

    /**
     * Calculates overlay position and shows it.
     */
    protected _showOverlay(): void {
        const $content = this._$content;

        if (!$content.length) {
            return;
        }

        const overlayOffset: number = $content.offset().top;
        const overlayHeight: number = $(document).height() - overlayOffset;

        if (!this._$overlay || !this._$overlay.length) {
            this._$overlay = $(
                '<div class="cs-navigation__overlay"></div>'
            ).appendTo('body');
        }

        if (this._$overlay.length) {
            this._$overlay.css({
                height: overlayHeight,
                top: overlayOffset,
            });
        }

        this._$overlay.addClass('cs-navigation__overlay--visible');
    }

    /**
     * Hides overlay
     */
    protected _hideOverlay(): void {
        if (!this._$overlay || !this._$overlay.length) {
            return;
        }

        this._$overlay
            .css({
                height: 0,
                top: 0,
            })
            .removeClass('cs-navigation__overlay--visible');
    }

    /**
     * Makes given flyout visible by applying appropriate class.
     * @param {JQuery} $flyout Target flyout to set class to.
     */
    protected _showFlyout($flyout: JQuery): void {
        if (!$flyout.length) {
            return;
        }

        const $activeFlyout = this._$flyouts
            .filter(`.${this._options.flyoutClassName}--visible`)
            .not($flyout);
        this._hideFlyout($activeFlyout);

        $flyout
            .parent(`.${this._options.itemClassName}--main`)
            .addClass(`${this._options.itemClassName}--active`);
        $flyout.addClass(`${this._options.flyoutClassName}--visible`);
        this._adjustFlyout($flyout);
        this._showOverlay();
    }

    /**
     * Makes given flyout visible by applying appropriate class with short delay.
     * @param {JQuery} $flyout Target flyout to set class to.
     */
    protected _showFlyoutDelay($flyout: JQuery): void {
        this._showTimeout = setTimeout(() => {
            this._showFlyout($flyout);
        }, this._options.flyoutShowDelay);
    }

    /**
     * Makes given flyout visible by applying appropriate class with short delay.
     * @param {JQuery} $flyout Target flyout to set class to.
     */
    protected _resetFlyoutDelay(): void {
        clearTimeout(this._showTimeout);
    }

    /**
     * Hides given flyout by applying appropriate class.
     * @param {JQuery} $flyout Target flyout to remove class from.
     */
    protected _hideFlyout($flyout: JQuery): void {
        $flyout
            .parent(`.${this._options.itemClassName}--main`)
            .removeClass(`${this._options.itemClassName}--active`);
        $flyout.removeClass(`${this._options.flyoutClassName}--visible`);
    }

    /**
     * Triggers browser layout reflow so we can get updated CSS values.
     * @param  {JQuery} $element Element to use to trigger reflow.
     */
    protected _triggerColumnsReflow($element: JQuery): void {
        $element.css('display', 'none');
        $element.prop('offsetWidth');
        $element.css('display', '');
    }

    /**
     * Attaches events needed by navigation component.
     */
    protected _attachEvents(): void {
        this._eventListeners.resizeListener = (): void => {
            clearTimeout(this._resizeTimeout);
            setTimeout(() => {
                this._containerClientRect = this._$container
                    .get(0)
                    .getBoundingClientRect();
                this._viewportWidth = this._$window.width();
            }, this._options.resizeDebounce);
        };

        this._eventListeners.itemFocusInListener = (
            event: JQuery.FocusInEvent
        ): void => {
            const $targetFlyout: JQuery = $(event.target as HTMLElement)
                .parent()
                .find(this._$flyouts);
            this._showFlyout($targetFlyout);
        };
        // Don't let focus events propagate from flyouts to items.
        this._eventListeners.flyoutFocusInListener = (
            event: JQuery.FocusInEvent
        ): void => {
            event.stopPropagation();
        };

        this._eventListeners.focusOutListener = (
            event: JQuery.FocusOutEvent
        ): void => {
            this._hideFlyout(
                $(event.target as HTMLElement)
                    .closest(`.${this._options.itemClassName}--main`)
                    .find(this._$flyouts)
            );
        };

        this._eventListeners.itemMouseenterListener = (
            event: JQuery.MouseEnterEvent
        ): void => {
            // Some iPads can trigger mouseenter event and cancel action on first touch to simulate hover effect
            // There are special touch events for touch device, so mouseenter can be canceled
            if ($('body').hasClass('touch-device')) {
                return;
            }

            if (this._options.enhancedFlyoutHover) {
                this._oldX = event.pageX;
                this._oldY = event.pageY;

                const $activeFlyout = this._$element.find(
                    `.${this._options.flyoutClassName}--visible`
                );

                if (
                    $activeFlyout.length &&
                    event.offsetY > event.target.offsetHeight / 2
                ) {
                    return;
                }
            }

            const $rootItem: JQuery = $(event.target as HTMLElement)
                .closest(`.${this._options.itemClassName}--main`)
                .find(this._$flyouts);

            this._showFlyoutDelay($rootItem);

            if (!$rootItem.length) {
                this._hideOverlay();
            }
        };

        this._eventListeners.itemTouchStartListener = (
            event: JQuery.TouchStartEvent
        ): void => {
            const $target: JQuery = $(event.target as HTMLElement);
            const $rootItem: JQuery = $target.closest(
                `.${this._options.itemClassName}--main`
            );
            const $targetFlyout: JQuery = $rootItem.find(this._$flyouts);
            // Checks if item has no flyout or that touch was triggered inside it.
            if (
                !$targetFlyout.length ||
                $target.closest(this._$flyouts).length
            ) {
                return;
            }

            event.preventDefault();

            if (
                $targetFlyout.hasClass(
                    `${this._options.flyoutClassName}--visible`
                )
            ) {
                this._hideFlyout($targetFlyout);
            } else {
                $rootItem.focus();
                this._showFlyout($targetFlyout);
            }

            $targetFlyout
                .find(`.${this._options.itemClassName}--level_1`)
                .removeClass(`${this._options.itemClassName}--hidden`);
        };

        this._eventListeners.windowTouchStartListener = (
            event: JQuery.TouchStartEvent
        ): void => {
            const $target: JQuery = $(event.target as HTMLElement);
            const $rootItem: JQuery = $target.closest(
                `.${this._options.itemClassName}--main`
            );
            // Checks if clicked outside of the navigation.
            if (!$rootItem.length) {
                const $activeFlyout = this._$element.find(
                    `.${this._options.flyoutClassName}--visible`
                );
                this._hideFlyout($activeFlyout);
            }
        };

        this._eventListeners.itemMousemoveListener = (
            event: JQuery.MouseMoveEvent
        ): void => {
            // Detect if mouse is moving to the bottom (with overlap of 10px)
            let direction = '';

            if (
                event.pageX <= this._oldX + 10 &&
                event.pageX >= this._oldX - 10 &&
                event.pageY > this._oldY
            ) {
                direction = 'bottom';
            }

            this._moveDirection = direction;

            this._oldX = event.pageX;
            this._oldY = event.pageY;
        };

        this._eventListeners.itemMouseleaveListener = (
            event: JQuery.MouseLeaveEvent
        ): void => {
            // Some iPads can trigger mouseleave event and cancel action on first touch to simulate hover effect
            // There are special touch events for touch device, so mouseleave can be canceled
            if ($('body').hasClass('touch-device')) {
                return;
            }

            if (this._options.enhancedFlyoutHover) {
                if (
                    this._moveDirection === 'bottom' &&
                    event.offsetY > event.target.offsetHeight / 3 &&
                    event.offsetY <= event.target.offsetHeight
                ) {
                    return;
                }
            }

            clearTimeout(this._showTimeout);
            this._hideFlyout(
                $(event.target as HTMLElement)
                    .closest(`.${this._options.itemClassName}--main`)
                    .find(this._$flyouts)
            );
        };

        this._eventListeners.navigationMouseleaveListener = (
            event: JQuery.MouseLeaveEvent
        ): void => {
            this._hideOverlay();
        };

        this._$window.on(
            'resize orientationchange',
            this._eventListeners.resizeListener
        );
        this._$window.on(
            'touchstart',
            this._eventListeners.windowTouchStartListener
        );

        const $rootItems: JQuery = $(`.${this._options.itemClassName}--main`);
        $rootItems.on('focusin', this._eventListeners.itemFocusInListener);
        $rootItems.on(
            'touchstart',
            this._eventListeners.itemTouchStartListener
        );
        $rootItems.on(
            'mouseenter',
            this._eventListeners.itemMouseenterListener
        );
        $rootItems.on(
            'mouseleave',
            this._eventListeners.itemMouseleaveListener
        );
        this._$element.on(
            'mouseleave',
            this._eventListeners.navigationMouseleaveListener
        );
        this._$flyouts.on(
            'focusin',
            this._eventListeners.flyoutFocusInListener
        );
        // When the last link from flyout loses focus.
        $rootItems
            .find('a:last')
            .on('focusout', this._eventListeners.focusOutListener);

        if (this._options.enhancedFlyoutHover) {
            $rootItems.on(
                'mousemove',
                this._eventListeners.itemMousemoveListener
            );
        }
    }

    protected _getColumnsForViewport() {
        const maxColumnCount = this._options.flyoutMaxColumnCount;
        if (typeof maxColumnCount === 'number') {
            return maxColumnCount;
        }

        const viewportWidth = this._viewportWidth;
        const breakpoints = Object.keys(maxColumnCount);
        let columns = maxColumnCount[breakpoints[0]];
        breakpoints.some((breakpoint) => {
            if (viewportWidth <= Number(breakpoint)) {
                return true;
            }

            columns = maxColumnCount[breakpoint];
        });

        return columns;
    }

    /**
     * Detaches events set by navigation component.
     */
    protected _detachEvents(): void {
        this._$window.off(
            'resize orientationchange',
            this._eventListeners.resizeListener
        );
        this._$window.off(
            'touchstart',
            this._eventListeners.windowTouchStartListener
        );

        const $rootItems: JQuery = $(`.${this._options.itemClassName}--main`);
        $rootItems.off(
            'mouseenter',
            this._eventListeners.itemMouseenterListener
        );
        $rootItems.off(
            'mouseleave',
            this._eventListeners.itemMouseleaveListener
        );
        $rootItems.off(
            'touchstart',
            this._eventListeners.itemTouchStartListener
        );
        $rootItems.off('focusin', this._eventListeners.itemFocusInListener);
        this._$element.off(
            'mouseleave',
            this._eventListeners.navigationMouseleaveListener
        );
        this._$flyouts.off(
            'focusin',
            this._eventListeners.flyoutFocusInListener
        );
        // When the last link from flyout loses focus.
        $rootItems
            .find('a:last')
            .off('focusout', this._eventListeners.focusOutListener);
    }
}
