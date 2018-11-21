import * as $ from 'jquery';
import Navigation from 'components/navigation/navigation';

export default class NavigationMegaDropdown extends Navigation {
    protected _allCategoriesItemSelector: string =
        '[data-category-identifier="all-categories"]';
    protected _$activeMegaSubmenu: JQuery = $();

    protected _adjustFlyout($flyout: JQuery): void {
        const $parentItem: JQuery = $flyout.closest(
            `.${this._options.itemClassName}--level_0`
        );

        if ($parentItem.is(this._allCategoriesItemSelector)) {
            return;
        }

        super._adjustFlyout($flyout);
    }

    protected _hideFlyout($flyout: JQuery): void {
        super._hideFlyout($flyout);

        this._hideMegaSubmenu(
            $flyout.find('.cs-navigation__list--all-categories').nextAll()
        );
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
        const submenuMaxColumns = this._options.flyoutMaxColumnCount - 1;

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

    protected _showMegaSubmenu($megaSubmenu: JQuery): void {
        if (!$megaSubmenu.length) {
            return;
        }

        const parentItemId = $megaSubmenu.data('parent-item-id');
        $megaSubmenu.removeClass('cs-navigation__list--hidden');
        $megaSubmenu
            .parent()
            .find(`[data-category-id="${parentItemId}"]`)
            .addClass(`${this._options.itemClassName}--active`);
        this._adjustMegaSubmenuColumns($megaSubmenu);
        this._$activeMegaSubmenu = $megaSubmenu;
    }

    protected _hideMegaSubmenu($megaSubmenu: JQuery): void {
        if (!$megaSubmenu.length) {
            return;
        }

        const parentItemId = $megaSubmenu.data('parent-item-id');
        $megaSubmenu.removeClass('cs-navigation__list--hidden');
        $megaSubmenu
            .parent()
            .find(`[data-category-id="${parentItemId}"]`)
            .removeClass(`${this._options.itemClassName}--active`);
        $megaSubmenu.addClass('cs-navigation__list--hidden');
        this._$activeMegaSubmenu = $();
    }

    protected _attachEvents(): void {
        super._attachEvents();

        const $allCategoriesList: JQuery = $(
            '.cs-navigation__list--all-categories'
        );
        const $allCategoriesItems: JQuery = $allCategoriesList.find(
            `.${this._options.itemClassName}--level_1`
        );
        const $megaSubmenus = $allCategoriesList.nextAll();
        let $activeMegaSubmenu: JQuery;

        let previousXPositions: number[] = [];
        let submenuShowTimeout;

        $allCategoriesList.on('mousemove', (event: JQuery.Event) => {
            previousXPositions.push(event.pageX);

            if (previousXPositions.length > 3) {
                previousXPositions.shift();
            }

            const horizontalChange = Math.abs(
                previousXPositions[0] -
                    previousXPositions[previousXPositions.length - 1]
            );

            const targetCategoryId = $(event.target)
                .closest($allCategoriesItems)
                .data('category-id');
            const $targetSubmenu: JQuery = $megaSubmenus.filter(
                `[data-parent-item-id="${targetCategoryId}"]`
            );

            if ($targetSubmenu.is(this._$activeMegaSubmenu)) {
                return;
            }

            if (!$targetSubmenu.length) {
                this._hideMegaSubmenu(this._$activeMegaSubmenu);
            }

            if ($targetSubmenu.length && !this._$activeMegaSubmenu) {
                this._showMegaSubmenu($targetSubmenu);
            } else if (horizontalChange < 3) {
                clearInterval(submenuShowTimeout);

                submenuShowTimeout = setTimeout(() => {
                    this._hideMegaSubmenu(this._$activeMegaSubmenu);
                    this._showMegaSubmenu($targetSubmenu);
                }, 20);
            }
        });

        $allCategoriesItems.on('touchstart', (event: JQuery.Event) => {
            const targetCategoryId = $(event.target)
                .closest($allCategoriesItems)
                .data('category-id');
            const $targetSubmenu = $megaSubmenus.filter(
                `[data-parent-item-id="${targetCategoryId}"]`
            );

            if ($targetSubmenu.length) {
                event.preventDefault();
                this._hideMegaSubmenu(this._$activeMegaSubmenu);
                this._showMegaSubmenu($targetSubmenu);
            }
        });

        $megaSubmenus.on('mouseleave', () => {
            this._hideMegaSubmenu(this._$activeMegaSubmenu);
        });
    }
}
