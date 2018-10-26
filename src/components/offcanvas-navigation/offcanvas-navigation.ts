import * as $ from 'jquery';

/**
 * Component options interface.
 */
export interface OffcanvasNavigationOptions {
    className?: string;
    showCategoryIcon?: boolean;
    showProductsCount?: boolean;
}
/**
 * Offcanvas navigation component responsible for multilevel offcanvas navigation menu.
 */
export default class OffcanvasNavigation {
    protected _$element: JQuery;
    protected _$parentLink: JQuery;
    protected _$returnLink: JQuery;

    protected _eventListeners: {
        offcanvasHide?: (event: JQuery.Event) => void;
        parentLinkClick?: (event: JQuery.Event) => void;
        returnLinkClick?: (event: JQuery.Event) => void;
    } = {};

    public _options: OffcanvasNavigationOptions;

    /**
     * Creates offcanvas navigation with optional given element and options.
     * @param  {JQuery}                     $element jQuery element to initialize navigation on.
     * @param  {OffcanvasNavigationOptions} options  Optional settings for a component.
     */
    public constructor(
        $element?: JQuery,
        options?: OffcanvasNavigationOptions
    ) {
        this._options = $.extend(
            {
                className: 'offcanvas-navigation',
                showCategoryIcon: false,
                showProductsCount: false,
            },
            options
        );

        this._$element = $element || $(`.${this._options.className}`);
        if (this._$element.length === 0) {
            return;
        }

        this._$parentLink = this._$element.find(
            `.${this._options.className}__link--parent`
        );
        this._$returnLink = this._$element.find(
            `.${this._options.className}__link--return`
        );

        this._addEventListeners();
    }

    /**
     * Returns component element.
     * @return {JQuery} Component element.
     */
    public getElement(): JQuery {
        return this._$element;
    }

    /**
     * Shows next navigation level based on clicked parent link.
     * @param {Event} event [description]
     */
    protected _showLevel(event: Event): void {
        event.preventDefault();
        const $levelToShow = $(event.target).hasClass(
            `${this._options.className}__link--parent`
        )
            ? $(event.target).next()
            : $(event.target)
                  .parents(`.${this._options.className}__link--parent`)
                  .first()
                  .next();
        const $currentLevel = $(`.${this._options.className}__list--current`);

        if ($currentLevel.length > 0) {
            $currentLevel.animate({ scrollTop: 0 }, 'medium', () => {
                $currentLevel.removeClass(
                    `${this._options.className}__list--current`
                );
                $levelToShow.addClass(
                    `${this._options.className}__list--active ${
                        this._options.className
                    }__list--current`
                );
            });
        } else {
            $levelToShow.addClass(
                `${this._options.className}__list--active ${
                    this._options.className
                }__list--current`
            );
        }
    }

    /**
     * Hides current navigation level based on clicked return link.
     * @param {Event} event [description]
     */
    protected _hideLevel(event: Event): void {
        event.preventDefault();
        const $levelToHide = $(event.target).closest(
            `.${this._options.className}__list`
        );
        $levelToHide.removeClass(
            `${this._options.className}__list--active ${
                this._options.className
            }__list--current`
        );
        $levelToHide
            .parent()
            .closest(`.${this._options.className}__list`)
            .addClass(`${this._options.className}__list--current`);
    }
    /**
     * Resets levels to root.
     */
    protected _resetLevels(): void {
        const $levelsToHide = this._$element.find(
            `.${this._options.className}__list`
        );
        // Reset all levels.
        $levelsToHide.removeClass(
            `${this._options.className}__list--active ${
                this._options.className
            }__list--current`
        );
        // Set root level to current.
        $levelsToHide
            .eq(0)
            .addClass(`${this._options.className}__list--current`);
    }
    /**
     * Sets up event listeners for a component.
     */
    protected _addEventListeners(): void {
        this._eventListeners.offcanvasHide = this._resetLevels.bind(this);
        $(document).on('offcanvas-hide', this._eventListeners.offcanvasHide);

        this._eventListeners.parentLinkClick = this._showLevel.bind(this);
        this._$parentLink.on('click', this._eventListeners.parentLinkClick);

        this._eventListeners.returnLinkClick = this._hideLevel.bind(this);
        this._$returnLink.on('click', this._eventListeners.returnLinkClick);
    }
    /**
     * Removes event listeners for a component.
     */
    protected _removeEventListeners(): void {
        $(document).off('offcanvas-hide', this._eventListeners.offcanvasHide);
        this._$parentLink.off('click', this._eventListeners.parentLinkClick);
        this._$returnLink.off('click', this._eventListeners.returnLinkClick);
    }
}
