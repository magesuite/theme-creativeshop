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
     * Maximum number of columns with categories that flyout can have.
     */
    flyoutMaxColumnCount?: number;
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
}

/**
 * Dropdown navigation that supports 3 category level links.
 */
export default class Navigation {
    protected _$element: JQuery;
    protected _$window: JQuery<Window> = $(window);
    protected _$container: JQuery;
    protected _containerClientRect: ClientRect;
    protected _$flyouts: JQuery;
    protected _$content: JQuery;
    protected _$overlay: JQuery;
    protected _eventListeners: {
        resizeListener?: (event: JQuery.Event) => void;
        itemFocusInListener?: (event: JQuery.Event) => void;
        flyoutFocusInListener?: (event: JQuery.Event) => void;
        focusOutListener?: (event: JQuery.Event) => void;
        itemTouchStartListener?: (event: JQuery.Event) => void;
        windowTouchStartListener?: (event: JQuery.Event) => void;
        itemMouseenterListener?: (event: JQuery.Event) => void;
        itemMouseleaveListener?: (event: JQuery.Event) => void;
        navigationMouseleaveListener?: (event: JQuery.Event) => void;
    } = {};
    protected _resizeTimeout: any;
    protected _showTimeout: any;

    protected _options: NavigationOptions = {
        containerClassName: 'cs-navigation__list--level_0',
        itemClassName: 'cs-navigation__item',
        flyoutClassName: 'cs-navigation__flyout',
        flyoutColumnsClassName: 'cs-navigation__list--level_1',
        flyoutMaxHeight: 400,
        flyoutMaxColumnCount: 5,
        resizeDebounce: 100,
        flyoutShowDelay: 200,
        flyoutAlignTo: 'center',
        flyoutAlignSwitch: 0,
        roundTransformLeft: true,
        contentSelector: '#maincontent',
        highlightActiveCategory: true,
        highlightWholeTree: true,
        activeCategoryClassName: 'active',
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
        this._options = $.extend(this._options, options);
        this._$content = $(this._options.contentSelector);
        this._$flyouts = $element.find(`.${this._options.flyoutClassName}`);
        this._$container = $element
            .find(`.${this._options.containerClassName}`)
            .addBack(`.${this._options.containerClassName}`); // Allow navigation partent to be container itself.
        this._containerClientRect = this._$container
            .get(0)
            .getBoundingClientRect();

        if (this._options.highlightActiveCategory) {
            this._highlightActiveCategory();
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

        const $rootItems: JQuery = $(
            `.${this._options.itemClassName}--level_0`
        );
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
        const $activeCategoryIndicator: JQuery = $('#active-category-id');
        if (!$activeCategoryIndicator.length) {
            return;
        }

        const activeCategoryId: number = $activeCategoryIndicator.data(
            'active-category-id'
        );
        if (activeCategoryId) {
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
        }
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
            `.${this._options.itemClassName}--level_0`
        ).length;
        const alignSwitch = this._options.flyoutAlignSwitch;
        const switchAt =
            alignSwitch > 0 ? alignSwitch : alignSwitch + itemsLength;
        const flyoutIndex = $flyout
            .closest(`.${this._options.itemClassName}--level_0`)
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
     * @param $flyout jQuery flyout element.
     */
    protected _adjustFlyoutExtras($flyout: JQuery) {
        const $flyoutExtras: JQuery = $flyout.children(
            `:not(.${this._options.flyoutColumnsClassName})`
        );
        $flyoutExtras.css({
            'max-width': `${(this._containerClientRect.width /
                this._options.flyoutMaxColumnCount) *
                2}px`,
        });
    }

    /**
     * Adjusts the number of flyout columns.
     * The goal is to have as few columns as possible when keeping flyout's height bellow given max height.
     * @param {JQuery} $flyout [description]
     */
    protected _adjustFlyoutColumns($flyout: JQuery): void {
        const $flyoutColumns: JQuery = $flyout.find(
            `.${this._options.flyoutColumnsClassName}`
        );
        this._setColumnCount($flyoutColumns, 1);

        const flyoutMaxHeight: number = this._options.flyoutMaxHeight;
        const flyoutMaxColumns = this._options.flyoutMaxColumnCount;

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
        const $flyoutColumns: JQuery = $flyout.find(
            `.${this._options.flyoutColumnsClassName}`
        );
        const flyoutClientRect: ClientRect = $flyout
            .get(0)
            .getBoundingClientRect();
        const containerClientRect: ClientRect = this._containerClientRect;
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
        $element.css({
            'column-count': columnCount,
            width: `${(this._containerClientRect.width /
                this._options.flyoutMaxColumnCount) *
                columnCount}px`,
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
            this._$overlay = $('<div class="cs-navigation__overlay"></div>')
                .css({
                    height: overlayHeight,
                    top: overlayOffset,
                })
                .appendTo('body');
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
            .parent(`.${this._options.itemClassName}--level_0`)
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
            .parent(`.${this._options.itemClassName}--level_0`)
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
            }, this._options.resizeDebounce);
        };

        this._eventListeners.itemFocusInListener = (
            event: JQuery.Event
        ): void => {
            const $targetFlyout: JQuery = $(event.target as HTMLElement)
                .parent()
                .find(this._$flyouts);
            this._showFlyout($targetFlyout);
        };
        // Don't let focus events propagate from flyouts to items.
        this._eventListeners.flyoutFocusInListener = (
            event: JQuery.Event
        ): void => {
            event.stopPropagation();
        };

        this._eventListeners.focusOutListener = (event: JQuery.Event): void => {
            this._hideFlyout(
                $(event.target as HTMLElement)
                    .closest(`.${this._options.itemClassName}--level_0`)
                    .find(this._$flyouts)
            );
        };

        this._eventListeners.itemMouseenterListener = (
            event: JQuery.Event
        ): void => {
            const $rootItem: JQuery = $(event.target as HTMLElement)
                .closest(`.${this._options.itemClassName}--level_0`)
                .find(this._$flyouts);

            this._showFlyoutDelay($rootItem);

            if (!$rootItem.length) {
                this._hideOverlay();
            }
        };

        this._eventListeners.itemTouchStartListener = (
            event: JQuery.Event
        ): void => {
            const $target: JQuery = $(event.target as HTMLElement);
            const $rootItem: JQuery = $target.closest(
                `.${this._options.itemClassName}--level_0`
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
            event: JQuery.Event
        ): void => {
            const $target: JQuery = $(event.target as HTMLElement);
            const $rootItem: JQuery = $target.closest(
                `.${this._options.itemClassName}--level_0`
            );
            // Checks if clicked outside of the navigation.
            if (!$rootItem.length) {
                const $activeFlyout = this._$element.find(
                    `.${this._options.flyoutClassName}--visible`
                );
                this._hideFlyout($activeFlyout);
            }
        };

        this._eventListeners.itemMouseleaveListener = (
            event: JQuery.Event
        ): void => {
            clearTimeout(this._showTimeout);
            this._hideFlyout(
                $(event.target as HTMLElement)
                    .closest(`.${this._options.itemClassName}--level_0`)
                    .find(this._$flyouts)
            );
        };

        this._eventListeners.navigationMouseleaveListener = (
            event: JQuery.Event
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

        const $rootItems: JQuery = $(
            `.${this._options.itemClassName}--level_0`
        );
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

        const $rootItems: JQuery = $(
            `.${this._options.itemClassName}--level_0`
        );
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
