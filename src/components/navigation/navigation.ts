import * as $ from 'jquery';

import breakpoint from 'utils/breakpoint/breakpoint';

/**
 * Navigation component options interface.
 */
interface NavigationOptions {
    /**
     * Class name of navigation container. Flyout positions will be calculated
     * relative to this element.
     * @type {string}
     */
    containerClassName?: string;
    /**
     * Navigation list item element. It is used to enhance keyboard accessability.
     * @type {string}
     */
    itemClassName?: string;
    /**
     * Navigation flyout class name.
     * @type {string}
     */
    flyoutClassName?: string;
    /**
     * Navigation flyout columns container class name.
     * @type {string}
     */
    flyoutColumnsClassName?: string;
    /**
     * Navigation flyout category class name.
     * @type {string}
     */
    flyoutCategoryClassName?: string;
    /**
     * Desired max height of the flyout. Number of columns will be decreased until
     * flyout's height will be smaller then given max height.
     * @type {number}
     */
    flyoutMaxHeight?: number;
    /**
     * Default number of colums set for flyout by CSS.
     * @type {number}
     */
    flyoutDefaultColumnCount?: number;
    /**
     * Flyout class name that should be aplied to make it visible.
     * @type {[type]}
     */
    flyoutVisibleClassName?: string;
    /**
     * Tells how flyout should be aligned in relation to navigation item.
     * Possible values are:
     * - "center" - center of the flyout will be align to the center of an item.
     * - "left" - left edge of the flyout will be aligned to the left edge of an item.
     * - "right" - right edge of the flyout will be aligned to the left edge of an item.
     * @type {string}
     */
    flyoutAlignTo?: string;
    /**
     * Tells when navigation should switch between "left" and "right" align modes.
     * E.g. value "3" will align first 3 flyout normally and then switch, you
     * can also write "-3" to align normally for all but last 3 flyouts.
     *
     * @type {number}
     */
    flyoutAlignSwitch?: number;
    /**
     * Number of miliseconds to wait for next resize event before recalculating flyout positions.
     * @type {number}
     */
    resizeDebounce?: number;
    /**
     * Number of miliseconds to wait after hovering the mouse over a link before showing the flyout.
     * @type {number}
     */
    flyoutShowDelay?: number;
    /**
     * Round transform left on flyout to avoid blur in text..
     * @type {boolean}
     */
    roundTransformLeft?: boolean;
    /**
     * Tells if overlay (menu type - only on page content) should be shown along with flyout
     * @type {boolean}
     */
    showNavigationOverlay?: boolean;
    /**
     * if showNavigationOverlay is set to TRUE, overlay will be shown on the content and all elements under it
     * @type {string}
     */
    contentSelector?: string;
    /**
     * Tells if active category should be highlighted
     * @type {boolean}
     */
    highlightActiveCategory?: boolean;
    /**
     * If highlightActiveCategory is set to true, it let you decide if whole category tree should be highlighted
     * @type {boolean}
     */
    highlightWholeTree?: boolean;
    /**
     * Classname of active category (as addition to original)
     * @type {string}
     */
    activeCategoryClassName?: string;
}

/**
 * Dropdown navigation that supports 3 category level links.
 */
export default class Navigation {
    protected _$element: JQuery;
    protected _$window: JQuery = $(window);
    protected _$flyouts: JQuery;
    protected _$container: JQuery;
    protected _containerClientRect: ClientRect;
    protected _eventListeners: {
        resizeListener?: (event: Event) => void;
        itemFocusInListener?: (event: Event) => void;
        flyoutFocusInListener?: (event: Event) => void;
        focusOutListener?: (event: Event) => void;
        itemTouchStartListener?: (event: Event) => void;
        windowTouchStartListener?: (event: Event) => void;
        itemMouseenterListener?: (event: Event) => void;
        itemMouseleaveListener?: (event: Event) => void;
        navigationMouseleaveListener?: (event: Event) => void;
    } = {};
    protected _resizeTimeout: number;
    protected _showTimeout: number;

    protected _options: NavigationOptions = {
        containerClassName: 'cs-navigation__list--level_0',
        itemClassName: 'cs-navigation__item--level_0',
        flyoutClassName: 'cs-navigation__flyout',
        flyoutVisibleClassName: 'cs-navigation__flyout--visible',
        flyoutCategoryClassName: 'cs-navigation__item--level_1',
        flyoutColumnsClassName: 'cs-navigation__list--level_1',
        flyoutMaxHeight: 400,
        flyoutDefaultColumnCount: 5,
        resizeDebounce: 100,
        flyoutShowDelay: 200,
        flyoutAlignTo: 'center',
        flyoutAlignSwitch: 0,
        roundTransformLeft: true,
        showNavigationOverlay: false,
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
        this._adjustFlyouts(this._$flyouts);
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

        const $items: JQuery = $(`.${this._options.itemClassName}`);
        $items.each((index: number, element: HTMLElement) => {
            if (element.matches(':hover')) {
                $(element).trigger('mouseenter');
                // Break after first found element.
                return false;
            }
        });
    }

    /**
     * Highlights active category by adding ${this._options.activeCategoryClassName} class eiter to only last level category or whole category tree depending on component's settings
     */
    protected _highlightActiveCategory(): void {
        const $activeCategoryIndicator: JQuery = $('#active-category-id');
        if (
            $activeCategoryIndicator.length &&
            $activeCategoryIndicator.attr('data-active-category-id') &&
            $activeCategoryIndicator.data('active-category-id') !== ''
        ) {
            const activeCategoryId: number = $activeCategoryIndicator.data(
                'active-category-id'
            );
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
     * @param {JQuery} $flyouts jQuery collection of flyouts.
     */
    protected _adjustFlyouts($flyouts: JQuery): void {
        this._showFlyout($flyouts);
        this._setTransform($flyouts, '');
        this._triggerReflow($flyouts);

        $flyouts.each((index: number, flyout: HTMLElement) =>
            this._adjustFlyoutColumns($(flyout))
        );
        this._hideFlyout($flyouts);
        this._hideOverlay();

        this._triggerReflow($flyouts);
        /**
         * So Chrome has a bug which causes it to provide invalid width of the element
         * when changing it's number of colums in JS, even when triggering reflows.
         */
        requestAnimationFrame(() => {
            this._showFlyout($flyouts);
            this._triggerReflow($flyouts);

            let alignTo: string = this._options.flyoutAlignTo;
            const alignSwitch = this._options.flyoutAlignSwitch;
            const switchAt =
                alignSwitch > 0 ? alignSwitch : alignSwitch + $flyouts.length;
            $flyouts.each((index: number, flyout: HTMLElement) => {
                if (
                    index === switchAt &&
                    (alignTo === 'left' || alignTo === 'right')
                ) {
                    alignTo = alignTo === 'left' ? 'right' : 'left';
                }
                this._adjustFlyoutPosition($(flyout), alignTo);
            });
            this._hideFlyout($flyouts);
            this._hideOverlay();
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
        const flyoutMaxHeight: number = this._options.flyoutMaxHeight;
        let flyoutColumnCount: number =
            this._options.flyoutDefaultColumnCount - 1;
        let flyoutHeight: number = $flyout.height();
        let prevFlyoutHeight: number;

        for (; flyoutColumnCount > 0; flyoutColumnCount -= 1) {
            this._setColumnCount($flyoutColumns, flyoutColumnCount);
            prevFlyoutHeight = flyoutHeight;
            flyoutHeight = $flyout.height();

            if (
                flyoutHeight !== prevFlyoutHeight &&
                flyoutHeight >= flyoutMaxHeight
            ) {
                if (
                    flyoutHeight >= flyoutMaxHeight + 100 &&
                    flyoutColumnCount < this._options.flyoutDefaultColumnCount
                ) {
                    this._setColumnCount($flyoutColumns, flyoutColumnCount + 1);
                }
                break;
            }
        }
        this._removeEmptyColumns($flyout, flyoutColumnCount);
    }

    /**
     * Removes empty columns from flyout.
     * Because e.g. categories in flyout cannot break there may be a situation when
     * flyout will be higher then the limit but adding more columns won't do any good.
     * This method checks how many columns can be removed before flyout becomes higher.
     *
     * @param  {JQuery} $flyout           Flyout element.
     * @param  {number} flyoutColumnCount Current number of colums to speed up performance.
     */
    protected _removeEmptyColumns(
        $flyout: JQuery,
        flyoutColumnCount: number
    ): void {
        const $flyoutColumns: JQuery = $flyout.find(
            `.${this._options.flyoutColumnsClassName}`
        );
        let flyoutHeight: number = $flyout.height();
        let prevFlyoutHeight: number;

        for (; flyoutColumnCount > 0; flyoutColumnCount -= 1) {
            this._setColumnCount($flyoutColumns, flyoutColumnCount);
            prevFlyoutHeight = flyoutHeight;
            flyoutHeight = $flyout.height();
            // Allow for small margin of error of 10px.
            if (Math.abs(flyoutHeight - prevFlyoutHeight) > 10) {
                this._setColumnCount($flyoutColumns, flyoutColumnCount + 1);
                break;
            }
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
        });
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
        if ($(this._options.contentSelector).length) {
            const overlayPosition: number = $(
                this._options.contentSelector
            ).offset().top;
            const overlayHeight: number =
                $(document).height() - overlayPosition;
            let $overlay: any = $('.cs-navigation__overlay');

            if (!$overlay.length) {
                $('body').append('<div class="cs-navigation__overlay"></div>');
                $overlay = $('.cs-navigation__overlay');
            }

            $overlay
                .css({
                    height: overlayHeight,
                    top: overlayPosition,
                })
                .addClass('cs-navigation__overlay--visible');
        }
    }

    /**
     * Hides overlay
     */
    protected _hideOverlay(): void {
        const $overlay: any = $('.cs-navigation__overlay');

        if ($overlay.length) {
            $overlay
                .css({
                    height: '',
                    top: '',
                })
                .removeClass('cs-navigation__overlay--visible');
        }
    }

    /**
     * Makes given flyout visible by applying appropriate class.
     * @param {JQuery} $flyout Target flyout to set class to.
     */
    protected _showFlyout($flyout: JQuery): void {
        $flyout
            .parent(`.${this._options.itemClassName}`)
            .addClass(`${this._options.itemClassName}--active`);
        $flyout.addClass(this._options.flyoutVisibleClassName);
        if (
            $flyout.length &&
            this._options.showNavigationOverlay &&
            breakpoint.current >= breakpoint.tablet
        ) {
            this._showOverlay();
        }
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
            .parent(`.${this._options.itemClassName}`)
            .removeClass(`${this._options.itemClassName}--active`);
        $flyout.removeClass(this._options.flyoutVisibleClassName);
    }

    /**
     * Triggers browser layout reflow so we can get updated CSS values.
     * @param  {JQuery} $element Element to use to trigger reflow.
     */
    protected _triggerReflow($element: JQuery): void {
        $element.prop('offsetWidth');
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
                this._adjustFlyouts(this._$flyouts);
            }, this._options.resizeDebounce);
        };

        this._eventListeners.itemFocusInListener = (event: Event): void => {
            const $targetFlyout: JQuery = $(event.target)
                .parent()
                .find(`.${this._options.flyoutClassName}`);
            this._hideFlyout(this._$flyouts.not($targetFlyout));
            this._showFlyout($targetFlyout);
        };
        // Don't let focus events propagate from flyouts to items.
        this._eventListeners.flyoutFocusInListener = (event: Event): void => {
            event.stopPropagation();
        };

        this._eventListeners.focusOutListener = (event: Event): void => {
            this._hideFlyout(
                $(event.target)
                    .closest(`.${this._options.itemClassName}`)
                    .find(`.${this._options.flyoutClassName}`)
            );
        };

        this._eventListeners.itemMouseenterListener = (event: Event): void => {
            const $target: JQuery = $(event.target)
                .closest(`.${this._options.itemClassName}`)
                .find(`.${this._options.flyoutClassName}`);

            this._showFlyoutDelay($target);

            if (!$target.length) {
                this._hideOverlay();
            }
        };

        this._eventListeners.itemTouchStartListener = (event: Event): void => {
            const $target: JQuery = $(event.target);
            const $targetItem: JQuery = $target.closest(
                `.${this._options.itemClassName}`
            );
            const $targetFlyout: JQuery = $targetItem.find(
                `.${this._options.flyoutClassName}`
            );
            // Checks if item has no flyout or that touch was triggered inside it.
            if (
                !$targetFlyout.length ||
                $target.closest(`.${this._options.flyoutClassName}`).length
            ) {
                return;
            }

            event.preventDefault();

            if ($targetFlyout.hasClass(this._options.flyoutVisibleClassName)) {
                this._hideFlyout($targetFlyout);
            } else {
                $targetItem.focus();
                this._hideFlyout(this._$flyouts.not($targetFlyout));
                this._showFlyout($targetFlyout);
            }

            const $flyoutCategories: JQuery = $targetFlyout.find(
                `.${this._options.flyoutCategoryClassName}`
            );
            $flyoutCategories.removeClass(
                `${this._options.flyoutCategoryClassName}--hidden`
            );
        };

        this._eventListeners.windowTouchStartListener = (
            event: Event
        ): void => {
            const $target: JQuery = $(event.target).closest(
                `.${this._options.itemClassName}`
            );

            if (!$target.length) {
                this._hideFlyout(this._$flyouts);
            }
        };

        this._eventListeners.itemMouseleaveListener = (event: Event): void => {
            clearTimeout(this._showTimeout);
            this._hideFlyout(
                $(event.target)
                    .closest(`.${this._options.itemClassName}`)
                    .find(`.${this._options.flyoutClassName}`)
            );
        };

        this._eventListeners.navigationMouseleaveListener = (
            event: Event
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

        const $items: JQuery = $(`.${this._options.itemClassName}`);
        $items.on('focusin', this._eventListeners.itemFocusInListener);
        $items.on('touchstart', this._eventListeners.itemTouchStartListener);
        $items.on('mouseenter', this._eventListeners.itemMouseenterListener);
        $items.on('mouseleave', this._eventListeners.itemMouseleaveListener);
        this._$element.on(
            'mouseleave',
            this._eventListeners.navigationMouseleaveListener
        );
        this._$flyouts.on(
            'focusin',
            this._eventListeners.flyoutFocusInListener
        );
        // When the last link from flyout loses focus.
        $items
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

        const $items: JQuery = $(`.${this._options.itemClassName}`);
        $items.off('mouseenter', this._eventListeners.itemMouseenterListener);
        $items.off('mouseleave', this._eventListeners.itemMouseleaveListener);
        $items.off('touchstart', this._eventListeners.itemTouchStartListener);
        $items.off('focusin', this._eventListeners.itemFocusInListener);
        this._$element.off(
            'mouseleave',
            this._eventListeners.navigationMouseleaveListener
        );
        this._$flyouts.off(
            'focusin',
            this._eventListeners.flyoutFocusInListener
        );
        // When the last link from flyout loses focus.
        $items
            .find('a:last')
            .off('focusout', this._eventListeners.focusOutListener);
    }
}
