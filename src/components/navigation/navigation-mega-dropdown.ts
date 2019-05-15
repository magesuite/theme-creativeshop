import * as $ from 'jquery';
import {
    default as Navigation,
    NavigationOptions,
} from 'components/navigation/navigation';

export default class NavigationMegaDropdown extends Navigation {
    protected _allCategoriesItemSelector: string =
        '[data-category-identifier="all-categories"]';
    protected _activeParentId: number = 0;
    protected _$allCategoriesItem: JQuery;
    protected _$allCategoriesFlyout: JQuery;

    public constructor($element: JQuery, options?: NavigationOptions) {
        super($element, options);

        this._$allCategoriesItem = this._$element.find(
            this._allCategoriesItemSelector
        );
        this._$allCategoriesFlyout = this._$allCategoriesItem.find(
            this._$flyouts
        );
    }

    /**
     * Overwritten method which skips adjusting column count for "All categories" root list.
     * @param $flyout jQuery flyout element.
     */
    protected _adjustFlyout($flyout: JQuery): void {
        const $parentItem: JQuery = $flyout.closest(
            `.${this._options.itemClassName}--main, .${
                this._options.itemClassName
            }--all-categories`
        );

        if ($parentItem.is(this._$allCategoriesItem)) {
            this._adjustFlyoutExtras($flyout);
            const $flyoutColumns: JQuery = $flyout.find(
                `.${
                    this._options.flyoutColumnsClassName
                }, .cs-navigation__list--all-categories`
            );
            this._setColumnCount($flyoutColumns, 1);

            return;
        }

        super._adjustFlyout($flyout);
    }

    /**
     * Makes sure that active category children are hidden when hiding the flyout.
     * @param $flyout jQuery flyout element.
     */
    protected _hideFlyout($flyout: JQuery): void {
        super._hideFlyout($flyout);

        this._hideCategoryChildren(this._activeParentId);
    }

    /**
     * Adjusts the number of submenu columns.
     * The goal is to have as few columns as possible when keeping flyout's height bellow given max height.
     * @param {JQuery} $megaSubmenu Submenu to set columns for.
     */
    protected _adjustMegaSubmenuColumns($megaSubmenu: JQuery): void {
        const $flyout: JQuery = $megaSubmenu.closest(
            `.${this._options.flyoutClassName}`
        );
        this._setColumnCount($megaSubmenu, 1);

        const flyoutMaxHeight: number = this._options.flyoutMaxHeight;
        const submenuMaxColumns = this._getColumnsForViewport() - 1;

        let flyoutHeight: number = $flyout.height();
        let prevFlyoutHeight: number = 0;
        for (
            let submenuColumnCount = 1;
            submenuColumnCount < submenuMaxColumns;
            submenuColumnCount += 1
        ) {
            // Flyout height didn't decrease despite having more columns.
            if (Math.abs(flyoutHeight - prevFlyoutHeight) <= 10) {
                this._setColumnCount($megaSubmenu, submenuColumnCount - 1);
                break;
            }
            // Flyout is still too high.
            if (flyoutHeight >= flyoutMaxHeight + 100) {
                this._setColumnCount($megaSubmenu, submenuColumnCount + 1);
            }
            prevFlyoutHeight = flyoutHeight;
            flyoutHeight = $flyout.height();
        }
    }

    /**
     * Shows all children which have given parent category ID set.
     * @param parentCategoryId Parent category ID which children should be shown.
     */
    protected _showCategoryChildren(parentCategoryId: number): void {
        const $childSubmenu: JQuery = this._$allCategoriesFlyout.find(
            `.cs-navigation__list[data-parent-item-id="${parentCategoryId}"]`
        );
        const $childTeaser: JQuery = this._$allCategoriesFlyout.find(
            `.cs-navigation__teaser[data-parent-item-id="${parentCategoryId}"]`
        );

        this._$allCategoriesFlyout
            .find(`[data-category-id="${parentCategoryId}"]`)
            .addClass(`${this._options.itemClassName}--active`);

        if ($childSubmenu.length) {
            $childSubmenu.removeClass('cs-navigation__list--hidden');
            this._adjustMegaSubmenuColumns($childSubmenu);
        }

        $childTeaser.removeClass('cs-navigation__teaser--hidden');

        this._activeParentId = parentCategoryId;
    }

    /**
     * Hides all children which have given parent category ID set.
     * @param parentCategoryId Parent category ID which children should be hidden.
     */
    protected _hideCategoryChildren(parentCategoryId: number): void {
        const $childSubmenu: JQuery = this._$allCategoriesFlyout.find(
            `.cs-navigation__list[data-parent-item-id="${parentCategoryId}"]`
        );
        const $childTeaser: JQuery = this._$allCategoriesFlyout.find(
            `.cs-navigation__teaser[data-parent-item-id="${parentCategoryId}"]`
        );

        if (!$childSubmenu.length && $childTeaser.length) {
            return;
        }

        this._$allCategoriesFlyout
            .find(`[data-category-id="${parentCategoryId}"]`)
            .removeClass(`${this._options.itemClassName}--active`);

        $childSubmenu.addClass('cs-navigation__list--hidden');
        $childTeaser.addClass('cs-navigation__teaser--hidden');

        this._activeParentId = 0;
    }

    protected _highlightActiveCategory() {
        super._highlightActiveCategory();

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
                const parentCategoryId = $activeCategoryEl
                    .closest('.cs-navigation__list--level_1')
                    .data('parent-item-id');
                const $parentCategory = this._$container.find(
                    `[data-category-id="${parentCategoryId}"]`
                );
                $parentCategory
                    .addClass(this._options.activeCategoryClassName)
                    .data(
                        'active-class',
                        this._options.activeCategoryClassName
                    );
            }
        }
    }

    protected _attachEvents(): void {
        super._attachEvents();

        const $allCategoriesList: JQuery = $(
            '.cs-navigation__list--all-categories'
        );
        const $allCategoriesItems: JQuery = $allCategoriesList.find(
            `.${this._options.itemClassName}--all-categories`
        );

        const previousXPositions: number[] = [];
        let submenuShowTimeout;

        $allCategoriesList.on('mousemove', (event: JQuery.MouseMoveEvent) => {
            previousXPositions.push(event.pageX);

            if (previousXPositions.length > 3) {
                previousXPositions.shift();
            }

            const horizontalChange = Math.abs(
                previousXPositions[0] -
                    previousXPositions[previousXPositions.length - 1]
            );

            const targetParentId = $(event.target)
                .closest($allCategoriesItems)
                .data('category-id');
            if (targetParentId === this._activeParentId) {
                return;
            }

            const $categoryChildren: JQuery = this._$allCategoriesFlyout.find(
                `[data-parent-item-id="${targetParentId}"]`
            );
            if (!$categoryChildren.length) {
                this._hideCategoryChildren(this._activeParentId);
            }

            if ($categoryChildren.length && !this._activeParentId) {
                this._showCategoryChildren(targetParentId);
            } else if (horizontalChange < 3) {
                clearInterval(submenuShowTimeout);

                submenuShowTimeout = setTimeout(() => {
                    this._hideCategoryChildren(this._activeParentId);
                    this._showCategoryChildren(targetParentId);
                }, 20);
            }
        });

        $allCategoriesItems.on(
            'touchstart',
            (event: JQuery.TouchStartEvent) => {
                const targetParentId = $(event.target)
                    .closest($allCategoriesItems)
                    .data('category-id');
                const $categoryChildren = this._$allCategoriesFlyout.find(
                    `[data-parent-item-id="${targetParentId}"]`
                );

                if ($categoryChildren.length) {
                    event.preventDefault();
                    this._hideCategoryChildren(this._activeParentId);
                    this._showCategoryChildren(targetParentId);
                }
            }
        );
    }
}
